import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { request as undiciRequest } from 'undici';
import { runCrawler } from './crawler.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`Crawler backend running on port ${PORT}`));

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/api/integrations/bing/exchange', async (req, res) => {
    const clientId = process.env.BING_CLIENT_ID;
    const clientSecret = process.env.BING_CLIENT_SECRET;
    const { code, redirectUri } = req.body || {};

    if (!clientId || !clientSecret) {
        return res.status(500).json({
            error: 'Bing OAuth is not configured on the crawler server.',
            missing: [
                !clientId ? 'BING_CLIENT_ID' : null,
                !clientSecret ? 'BING_CLIENT_SECRET' : null
            ].filter(Boolean)
        });
    }

    if (!code || !redirectUri) {
        return res.status(400).json({
            error: 'Both `code` and `redirectUri` are required.'
        });
    }

    try {
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        });

        const response = await undiciRequest('https://www.bing.com/webmasters/oauth/token', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        const payloadText = await response.body.text();
        let payload = {};

        try {
            payload = JSON.parse(payloadText);
        } catch {
            payload = { raw: payloadText };
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
            return res.status(response.statusCode).json({
                error: 'Bing token exchange failed.',
                details: payload
            });
        }

        return res.json(payload);
    } catch (error) {
        console.error('Bing token exchange failed:', error);
        return res.status(500).json({
            error: 'Bing token exchange failed unexpectedly.'
        });
    }
});

const wss = new WebSocketServer({ server });
const activeSessions = new Map(); // sessionId -> { state, config }

// ─── Session cleanup: remove stale sessions older than 24h ───
setInterval(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [id, session] of activeSessions) {
        if (session.updatedAt < cutoff) {
            activeSessions.delete(id);
        }
    }
}, 60 * 60 * 1000); // Check every hour

wss.on('connection', (ws) => {
    let crawlerInstance = null;
    let sessionTimeout = null;

    // Per-session timeout: kill zombie crawls after 6 hours
    const SESSION_TIMEOUT = 6 * 60 * 60 * 1000;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'START_CRAWL') {
                // Stop any existing crawler for this connection
                if (crawlerInstance) {
                    await crawlerInstance.stop();
                    crawlerInstance = null;
                }

                // Clear previous timeout
                if (sessionTimeout) {
                    clearTimeout(sessionTimeout);
                }

                const sessionId = data.sessionId;
                const existingSession = sessionId ? activeSessions.get(sessionId) : null;
                const initialState = existingSession?.state || null;

                crawlerInstance = runCrawler(data.config, (event, payload) => {
                    // Save state on pause/stop
                    if (event === 'CRAWL_STOPPED' && sessionId) {
                        activeSessions.set(sessionId, {
                            state: payload.state,
                            config: data.config,
                            updatedAt: Date.now()
                        });
                    }

                    if (event === 'CRAWL_FINISHED' && sessionId) {
                        activeSessions.delete(sessionId);
                    }

                    // Send to client if connection is still open
                    if (ws.readyState === ws.OPEN) {
                        try {
                            ws.send(JSON.stringify({ type: event, payload }));
                        } catch {
                            // Connection dropped mid-send, ignore
                        }
                    }
                }, initialState);

                // Set session timeout
                sessionTimeout = setTimeout(async () => {
                    if (crawlerInstance) {
                        console.log(`Session timeout reached, stopping crawl for session ${sessionId}`);
                        await crawlerInstance.stop();
                        crawlerInstance = null;
                    }
                }, SESSION_TIMEOUT);

            } else if (data.type === 'STOP_CRAWL') {
                if (crawlerInstance) {
                    await crawlerInstance.stop();
                    crawlerInstance = null;
                }
                if (sessionTimeout) {
                    clearTimeout(sessionTimeout);
                    sessionTimeout = null;
                }
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
            if (ws.readyState === ws.OPEN) {
                try {
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        payload: { message: 'Server error processing your request.' }
                    }));
                } catch {}
            }
        }
    });

    ws.on('close', async () => {
        if (crawlerInstance) {
            await crawlerInstance.stop();
            crawlerInstance = null;
        }
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            sessionTimeout = null;
        }
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});

// ─── Graceful Shutdown ──────────────────────────────────────
async function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Closing connections...`);

    // Close all WebSocket connections
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            try {
                client.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { message: 'Server is shutting down. Your scan progress has been saved.' }
                }));
            } catch {}
            client.close();
        }
    });

    wss.close(() => {
        server.close(() => {
            console.log('Server closed cleanly.');
            process.exit(0);
        });
    });

    // Force exit after 5 seconds if graceful shutdown hangs
    setTimeout(() => {
        console.log('Forced shutdown.');
        process.exit(1);
    }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled errors so the server doesn't crash
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
});
