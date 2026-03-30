import React, { useEffect, useMemo, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
    XCircle, Settings, Globe, Code, AlertTriangle, Wand2, Network, Server, 
    FastForward, Palette, CheckCircle2, Database, LinkIcon, Calendar, Clock,
    Play, Repeat, Bell, Shield, Upload, Sparkles
} from 'lucide-react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';

export default function CrawlerModals() {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const bingClientId = (import.meta as any).env?.VITE_BING_CLIENT_ID;
    const configuredCrawlerApiUrl = (import.meta as any).env?.VITE_CRAWLER_API_URL;
    const crawlerApiUrl = configuredCrawlerApiUrl || (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : 'http://localhost:3001');
    const hasGoogleOAuthConfig = Boolean(
        googleClientId &&
        googleClientId !== 'placeholder-client-id' &&
        String(googleClientId).includes('.apps.googleusercontent.com')
    );
    const hasBingOAuthConfig = Boolean(bingClientId);
    const {
        showListModal, setShowListModal,
        listUrls, setListUrls,
        showSettings, setShowSettings,
        settingsTab, setSettingsTab,
        config, setConfig,
        theme, setTheme,
        integrationConnections, saveIntegrationConnection, removeIntegrationConnection,
        showAutoFixModal, setShowAutoFixModal,
        autoFixItems, setAutoFixItems,
        isFixing, setIsFixing,
        autoFixProgress, setAutoFixProgress,
        setCrawlingMode, setPages,
        showScheduleModal, setShowScheduleModal,
        addLog
    } = useSeoCrawler();

    const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
    const [scheduleDay, setScheduleDay] = useState('monday');
    const [scheduleTime, setScheduleTime] = useState('09:00');
    const [scheduleNotify, setScheduleNotify] = useState(true);
    const [googleSites, setGoogleSites] = useState<string[]>([]);
    const [gaProperties, setGaProperties] = useState<Array<{ id: string; label: string }>>([]);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [bingLoading, setBingLoading] = useState(false);
    const googleAuthDiagnostics = useMemo(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return {
            origin,
            issues: [
                !hasGoogleOAuthConfig ? 'A valid Google OAuth client ID is not loaded into `VITE_GOOGLE_CLIENT_ID`.' : null,
                hasGoogleOAuthConfig ? `Add \`${origin}\` to Authorized JavaScript origins for this OAuth client.` : null,
                'If the consent screen is in Testing, add the Google account as a test user.',
                'Make sure the Search Console API and Google Analytics Admin API are enabled in Google Cloud.'
            ].filter(Boolean)
        };
    }, [hasGoogleOAuthConfig]);

    const bingAuthDiagnostics = useMemo(() => {
        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/?provider=bing` : '';
        return {
            redirectUri,
            issues: [
                !hasBingOAuthConfig ? 'A Microsoft application client ID is not loaded into `VITE_BING_CLIENT_ID`.' : null,
                'Register the same redirect URI in Bing Webmaster / Microsoft app settings.',
                'Set `BING_CLIENT_ID` and `BING_CLIENT_SECRET` on the crawler server so it can exchange the authorization code securely.'
            ].filter(Boolean)
        };
    }, [hasBingOAuthConfig]);

    const loadGoogleWorkspaceData = async (accessToken: string) => {
        setGoogleLoading(true);
        try {
            const [sitesRes, accountSummariesRes] = await Promise.all([
                fetch('https://www.googleapis.com/webmasters/v3/sites', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            ]);

            const nextSites: string[] = [];
            const nextProperties: Array<{ id: string; label: string }> = [];

            if (sitesRes.ok) {
                const sitesPayload = await sitesRes.json();
                (sitesPayload.siteEntry || []).forEach((entry: any) => {
                    if (entry?.siteUrl) nextSites.push(entry.siteUrl);
                });
                setGoogleSites(nextSites);
            } else {
                addLog('Connected to Google, but Search Console properties could not be listed yet.', 'info');
            }

            if (accountSummariesRes.ok) {
                const accountPayload = await accountSummariesRes.json();
                (accountPayload.accountSummaries || []).forEach((summary: any) => {
                    (summary.propertySummaries || []).forEach((property: any) => {
                        const propertyId = String(property?.property || '').split('/').pop();
                        if (propertyId) {
                            nextProperties.push({
                                id: propertyId,
                                label: `${property.displayName || propertyId} (${summary.displayName || 'Account'})`
                            });
                        }
                    });
                });
                setGaProperties(nextProperties);
            } else {
                addLog('Connected to Google, but GA4 properties could not be listed yet.', 'info');
            }

            setConfig((prev: any) => ({
                ...prev,
                gscSiteUrl: prev.gscSiteUrl || nextSites[0] || '',
                ga4PropertyId: prev.ga4PropertyId || nextProperties[0]?.id || ''
            }));

            if (integrationConnections.googleSearchConsole) {
                saveIntegrationConnection('googleSearchConsole', {
                    label: integrationConnections.googleSearchConsole.label,
                    status: 'connected',
                    authType: integrationConnections.googleSearchConsole.authType,
                    accountLabel: integrationConnections.googleSearchConsole.accountLabel,
                    scopes: integrationConnections.googleSearchConsole.scopes,
                    metadata: integrationConnections.googleSearchConsole.metadata,
                    selection: {
                        siteUrl: config?.gscSiteUrl || nextSites[0] || ''
                    },
                    sync: {
                        status: sitesRes.ok ? 'success' : 'partial',
                        lastSyncedAt: Date.now(),
                        coverage: nextSites.length > 0 ? 100 : 0,
                        coverageLabel: nextSites.length > 0 ? `${nextSites.length} sites` : 'No properties'
                    }
                });
            }

            if (integrationConnections.googleAnalytics) {
                saveIntegrationConnection('googleAnalytics', {
                    label: integrationConnections.googleAnalytics.label,
                    status: accountSummariesRes.ok ? 'connected' : 'degraded',
                    authType: integrationConnections.googleAnalytics.authType,
                    accountLabel: integrationConnections.googleAnalytics.accountLabel,
                    scopes: integrationConnections.googleAnalytics.scopes,
                    metadata: integrationConnections.googleAnalytics.metadata,
                    selection: {
                        propertyId: config?.ga4PropertyId || nextProperties[0]?.id || ''
                    },
                    sync: {
                        status: accountSummariesRes.ok ? 'success' : 'partial',
                        lastSyncedAt: Date.now(),
                        coverage: nextProperties.length > 0 ? 100 : 0,
                        coverageLabel: nextProperties.length > 0 ? `${nextProperties.length} properties` : 'No properties'
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load Google workspace data:', error);
            addLog('Google connected, but property discovery failed. Check API enablement and account permissions.', 'error');
        } finally {
            setGoogleLoading(false);
        }
    };

    useEffect(() => {
        const accessToken = config?.gscApiKey;
        if (!accessToken || googleSites.length > 0 || gaProperties.length > 0 || googleLoading) return;

        loadGoogleWorkspaceData(accessToken);
    }, [config?.gscApiKey, googleSites.length, gaProperties.length, googleLoading]);

    useEffect(() => {
        const selectedSite = config?.gscSiteUrl || '';
        const selectedPropertyId = config?.ga4PropertyId || '';

        if (integrationConnections.googleSearchConsole && selectedSite) {
            saveIntegrationConnection('googleSearchConsole', {
                label: integrationConnections.googleSearchConsole.label,
                status: integrationConnections.googleSearchConsole.status,
                authType: integrationConnections.googleSearchConsole.authType,
                accountLabel: integrationConnections.googleSearchConsole.accountLabel,
                scopes: integrationConnections.googleSearchConsole.scopes,
                selection: {
                    ...(integrationConnections.googleSearchConsole.selection || {}),
                    siteUrl: selectedSite
                },
                sync: integrationConnections.googleSearchConsole.sync,
                metadata: {
                    ...(integrationConnections.googleSearchConsole.metadata || {}),
                    siteUrl: selectedSite
                }
            });
        }

        if (integrationConnections.googleAnalytics && selectedPropertyId) {
            saveIntegrationConnection('googleAnalytics', {
                label: integrationConnections.googleAnalytics.label,
                status: integrationConnections.googleAnalytics.status,
                authType: integrationConnections.googleAnalytics.authType,
                accountLabel: integrationConnections.googleAnalytics.accountLabel,
                scopes: integrationConnections.googleAnalytics.scopes,
                selection: {
                    ...(integrationConnections.googleAnalytics.selection || {}),
                    propertyId: selectedPropertyId
                },
                sync: integrationConnections.googleAnalytics.sync,
                metadata: {
                    ...(integrationConnections.googleAnalytics.metadata || {}),
                    propertyId: selectedPropertyId
                }
            });
        }
    }, [config?.gscSiteUrl, config?.ga4PropertyId]);

    const beginBingOAuth = async () => {
        if (!hasBingOAuthConfig) {
            addLog('Bing OAuth is not configured. Add `VITE_BING_CLIENT_ID` first.', 'error');
            return;
        }

        const redirectUri = `${window.location.origin}/?provider=bing`;
        const state = `bing-${Date.now()}`;
        const authUrl = new URL('https://www.bing.com/webmasters/oauth/authorize');
        authUrl.searchParams.set('client_id', bingClientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'bingwebmaster');
        authUrl.searchParams.set('state', state);

        const popup = window.open(authUrl.toString(), 'headlight-bing-auth', 'width=560,height=720');
        if (!popup) {
            addLog('Popup blocked while opening Bing authentication.', 'error');
            return;
        }

        setBingLoading(true);

        try {
            const oauthMessage = await new Promise<any>((resolve, reject) => {
                const timeout = window.setTimeout(() => {
                    cleanup();
                    reject(new Error('Timed out waiting for Bing authentication.'));
                }, 120000);

                const pollClosed = window.setInterval(() => {
                    if (popup.closed) {
                        cleanup();
                        reject(new Error('Bing authentication window was closed before completing sign-in.'));
                    }
                }, 500);

                const onMessage = (event: MessageEvent) => {
                    if (event.origin !== window.location.origin) return;
                    if (event.data?.type !== 'headlight-oauth-callback') return;
                    if (event.data?.provider !== 'bing') return;
                    cleanup();
                    resolve(event.data);
                };

                const cleanup = () => {
                    window.clearTimeout(timeout);
                    window.clearInterval(pollClosed);
                    window.removeEventListener('message', onMessage);
                };

                window.addEventListener('message', onMessage);
            });

            if (oauthMessage.error) {
                throw new Error(String(oauthMessage.error));
            }

            const exchangeRes = await fetch(`${crawlerApiUrl}/api/integrations/bing/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: oauthMessage.code,
                    redirectUri
                })
            });

            const exchangePayload = await exchangeRes.json();
            if (!exchangeRes.ok || !exchangePayload?.access_token) {
                throw new Error(exchangePayload?.details?.error_description || exchangePayload?.error || 'Bing token exchange failed.');
            }

            saveIntegrationConnection('bingWebmaster', {
                label: 'Bing Webmaster',
                status: 'connected',
                authType: 'oauth',
                credentials: {
                    accessToken: exchangePayload.access_token,
                    refreshToken: exchangePayload.refresh_token || ''
                },
                metadata: {
                    expiresIn: String(exchangePayload.expires_in || '')
                },
                sync: {
                    status: 'success',
                    lastSyncedAt: Date.now(),
                    coverage: 100,
                    coverageLabel: 'Authenticated'
                }
            });

            setConfig((prev: any) => ({
                ...prev,
                bingAccessToken: exchangePayload.access_token
            }));

            addLog('Connected Bing Webmaster successfully.', 'success');
        } catch (error: any) {
            console.error('Bing Auth Error:', error);
            addLog(error?.message || 'Bing authentication failed.', 'error');
        } finally {
            setBingLoading(false);
        }
    };

    const connectGoogleData = useGoogleLogin({
        flow: 'implicit',
        scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly',
        onSuccess: async (tokenResponse) => {
            let accountLabel = 'Google account';
            addLog('Google authentication successful.', 'info');
            
            try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                });
                if (userRes.ok) {
                    const userInfo = await userRes.json();
                    accountLabel = userInfo.email || userInfo.name || accountLabel;
                }
            } catch (err) {
                console.error('Failed to fetch user info:', err);
            }

            saveIntegrationConnection('googleSearchConsole', {
                label: 'Google Search Console',
                status: 'connected',
                authType: 'oauth',
                accountLabel,
                scopes: ['webmasters.readonly'],
                credentials: {
                    accessToken: tokenResponse.access_token
                },
                selection: {
                    siteUrl: config?.gscSiteUrl || ''
                },
                metadata: {
                    siteUrl: config?.gscSiteUrl || ''
                },
                sync: {
                    status: 'syncing',
                    lastAttemptedAt: Date.now()
                }
            });
            
            saveIntegrationConnection('googleAnalytics', {
                label: 'Google Analytics 4',
                status: 'connected',
                authType: 'oauth',
                accountLabel,
                scopes: ['analytics.readonly'],
                credentials: {
                    accessToken: tokenResponse.access_token
                },
                selection: {
                    propertyId: config?.ga4PropertyId || ''
                },
                metadata: {
                    propertyId: config?.ga4PropertyId || ''
                },
                sync: {
                    status: 'syncing',
                    lastAttemptedAt: Date.now()
                }
            });

            setConfig((prev: any) => ({
                ...prev,
                gscApiKey: tokenResponse.access_token
            }));

            await loadGoogleWorkspaceData(tokenResponse.access_token);
            
            addLog(`Connected Google account: ${accountLabel}`, 'success');
        },
        onError: (error) => {
            console.error('Google Auth Error:', error);
            addLog('Google authentication failed. Check Authorized JavaScript origins, consent screen test users, and enabled APIs.', 'error');
            alert(`Google Auth Blocked: "This app's request is invalid."\n\nCheck these items in Google Cloud Console:\n1. Add ${window.location.origin} to Authorized JavaScript origins.\n2. If the app is in Testing, add your Google account as a test user.\n3. Enable Search Console API and Google Analytics Admin API.`);
        }
    });

    const saveManualIntegration = (
        provider: 'bingWebmaster' | 'ahrefs' | 'semrush',
        label: string,
        authType: 'token' | 'property' | 'oauth',
        credentials: Record<string, string>,
        metadata?: Record<string, string>
    ) => {
        saveIntegrationConnection(provider, {
            label,
            status: 'configured',
            authType: authType as any,
            credentials,
            metadata,
            sync: {
                status: 'success',
                lastSyncedAt: Date.now(),
                coverage: 100,
                coverageLabel: 'Configured'
            }
        });
        addLog(`${label} integration saved.`, 'success');
    };

    const handleCsvUpload = (file: File, provider: 'ahrefs' | 'semrush') => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;
            const lines = text.split('\n');
            if (lines.length < 2) return;
            
            const headers = lines[0].toLowerCase().split(',');
            const urlIdx = headers.findIndex(h => h.includes('url') || h.includes('target'));
            const refDomainIdx = headers.findIndex(h => h.includes('refdomains') || h.includes('referring') || h.includes('domains'));
            const ratingIdx = headers.findIndex(h => h.includes('ur') || h.includes('dr') || h.includes('rating') || h.includes('score'));

            if (urlIdx === -1) {
                addLog(`Could not find a URL column in the ${provider} CSV.`, 'error');
                return;
            }

            const updatesByUrl = new Map();
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length <= urlIdx) continue;
                const rowUrl = parts[urlIdx].replace(/^"|"$/g, '').trim();
                if (!rowUrl) continue;
                
                const metrics: any = {};
                if (refDomainIdx !== -1 && parts[refDomainIdx]) {
                    metrics.referringDomains = parseInt(parts[refDomainIdx].replace(/\D/g, ''), 10) || 0;
                }
                if (ratingIdx !== -1 && parts[ratingIdx]) {
                    metrics.urlRating = parseInt(parts[ratingIdx].replace(/\D/g, ''), 10) || 0;
                }
                updatesByUrl.set(rowUrl, metrics);
            }

            let matchedCount = 0;
            setPages((prevPages: any[]) => {
                const nextPages = prevPages.map(page => {
                    const cleanUrl = page.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    let match = updatesByUrl.get(page.url) || updatesByUrl.get(cleanUrl);
                    
                    if (!match) {
                        for (const [key, val] of updatesByUrl.entries()) {
                            if (cleanUrl.includes(key.replace(/^https?:\/\//, '').replace(/\/$/, ''))) {
                                match = val;
                                break;
                            }
                        }
                    }

                    if (match) {
                        matchedCount++;
                        return { ...page, ...match };
                    }
                    return page;
                });
                
                if (matchedCount > 0) {
                    addLog(`Successfully merged ${provider} metrics for ${matchedCount} crawled pages.`, 'success');
                } else {
                    addLog(`Parsed ${updatesByUrl.size} rows from ${provider} CSV, but no URLs matched current crawl data.`, 'info');
                }
                
                return nextPages;
            });
            
            saveIntegrationConnection(provider, {
                label: `${provider === 'ahrefs' ? 'Ahrefs' : 'SEMrush'} CSV`,
                status: 'configured',
                authType: 'property' as any,
                metadata: { dataset: 'backlinks_csv', sourceMode: 'csv', importedAt: String(Date.now()), filename: file.name },
                sync: {
                    status: 'success',
                    lastSyncedAt: Date.now(),
                    coverage: matchedCount > 0 ? 100 : 0,
                    coverageLabel: matchedCount > 0 ? `${matchedCount} matched URLs` : 'No URL matches'
                }
            });
        };
        reader.readAsText(file);
    };

    return (
        <>
            {showListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowListModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#181818]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Import URL List</h3>
                            <button onClick={() => setShowListModal(false)} className="text-gray-500 hover:text-white"><XCircle size={18}/></button>
                        </div>
                        <div className="p-5">
                            <p className="text-[12px] text-gray-500 mb-3">Paste one URL per line. We will scan each one individually.</p>
                            <textarea 
                                value={listUrls}
                                onChange={(e) => setListUrls(e.target.value)}
                                placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
                                className="w-full h-64 bg-[#0a0a0a] border border-[#222] rounded p-3 text-[13px] font-mono text-white focus:border-[#F5364E] focus:outline-none transition-colors custom-scrollbar"
                            />
                        </div>
                        <div className="px-5 py-4 border-t border-[#222] bg-[#181818] flex justify-end gap-3">
                            <button onClick={() => setShowListModal(false)} className="px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                            <button 
                                onClick={() => { setShowListModal(false); setCrawlingMode('list'); }}
                                className="px-6 py-2 bg-[#F5364E] text-white text-[12px] font-bold rounded hover:bg-[#e02d43] transition-colors"
                            >
                                Confirm List ({listUrls?.split('\n').filter((u: string) => u.trim()).length || 0} URLs)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
                    <div className="relative w-full max-w-4xl h-[600px] flex bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-[220px] bg-[#141414] border-r border-[#222] flex flex-col">
                            <div className="h-[60px] flex items-center px-5 border-b border-[#222]">
                                <h3 className="text-[14px] font-bold text-white flex items-center gap-2"><Settings size={16} className="text-[#F5364E]"/> Configuration</h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {[
                                    { id: 'general', label: 'General & Limits', icon: <Globe size={14}/> },
                                    { id: 'extraction', label: 'Rendering & Extract', icon: <Code size={14}/> },
                                    { id: 'rules', label: 'Rules & Exclusions', icon: <AlertTriangle size={14}/> },
                                    { id: 'ai', label: 'AI & NLP Analysis', icon: <Wand2 size={14}/> },
                                    { id: 'integrations', label: 'API Integrations', icon: <Network size={14}/> },
                                    { id: 'auth', label: 'Auth & Headers', icon: <Server size={14}/> },
                                    { id: 'proxies', label: 'Proxies', icon: <Globe size={14}/> },
                                    { id: 'scheduling', label: 'Scheduling', icon: <FastForward size={14}/> },
                                    { id: 'display', label: 'Display & Theme', icon: <Palette size={14}/> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSettingsTab(tab.id as any)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[12px] font-medium transition-colors ${settingsTab === tab.id ? 'bg-[#F5364E]/10 text-[#F5364E]' : 'text-[#888] hover:bg-[#222] hover:text-[#ccc]'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                {settingsTab === 'general' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Crawl Limits</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Max URLs</label>
                                                    <input type="number" value={config?.limit || ''} onChange={e => setConfig({...config, limit: e.target.value})} placeholder="Unlimited" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Max Depth</label>
                                                    <input type="number" value={config?.maxDepth || ''} onChange={e => setConfig({...config, maxDepth: e.target.value})} placeholder="Unlimited" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Max Threads (Concurrency)</label>
                                                    <input type="number" value={config?.threads || 5} onChange={e => setConfig({...config, threads: parseInt(e.target.value)})} min="1" max="20" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Crawl Speed</label>
                                                    <select value={config?.crawlSpeed || 'normal'} onChange={e => setConfig({...config, crawlSpeed: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none">
                                                        <option value="slow">Slow (Respectful)</option>
                                                        <option value="normal">Normal</option>
                                                        <option value="fast">Fast (Aggressive)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Execution Engine</h4>
                                            <div className="space-y-4">
                                                <label className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg cursor-pointer" onClick={() => setConfig({...config, useGhostEngine: !config?.useGhostEngine})}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${config?.useGhostEngine ? 'bg-[#F5364E]/10 text-[#F5364E]' : 'bg-[#222] text-[#666]'}`}>
                                                            <Sparkles size={16}/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[12px] text-white font-medium mb-0.5">Ghost Engine (Local-Only)</div>
                                                            <div className="text-[10px] text-[#666] pr-8">Run crawl directly from your browser's IP. Enterprise-grade speed with zero server footprint. Best for bypassing rate limits.</div>
                                                        </div>
                                                    </div>
                                                    <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${config?.useGhostEngine ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.useGhostEngine ? 'right-1' : 'left-1'}`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Identity</h4>
                                            <div>
                                                <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">User Agent String</label>
                                                <input type="text" value={config?.userAgent || ''} onChange={e => setConfig({...config, userAgent: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                <p className="text-[10px] text-[#555] mt-1">Change this to emulate Googlebot, Bingbot, or mobile devices.</p>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {settingsTab === 'extraction' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Rendering Mode</h4>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setConfig({...config, jsRendering: !config?.jsRendering})}>
                                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.jsRendering ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.jsRendering ? 'right-1' : 'left-1'}`}></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] text-white font-medium">Enable JavaScript Rendering</div>
                                                        <div className="text-[10px] text-[#666]">Execute client-side JS (React/Vue/Angular) before parsing. Slower crawl speed.</div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setConfig({...config, fetchWebVitals: !config?.fetchWebVitals})}>
                                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.fetchWebVitals ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.fetchWebVitals ? 'right-1' : 'left-1'}`}></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] text-white font-medium">Fetch Core Web Vitals (Lighthouse API)</div>
                                                        <div className="text-[10px] text-[#666]">Collect real-user LCP, CLS, INP metrics during crawl.</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Custom Extraction</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Extract via CSS Selector</label>
                                                    <input type="text" value={config?.extractCss || ''} onChange={e => setConfig({...config, extractCss: e.target.value})} placeholder="e.g. .product-price, #author-name" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Extract via Regex</label>
                                                    <input type="text" value={config?.extractRegex || ''} onChange={e => setConfig({...config, extractRegex: e.target.value})} placeholder="e.g. UA-[0-9]+-[0-9]+" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {settingsTab === 'rules' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer group mb-4" onClick={() => setConfig({...config, respectRobots: !config?.respectRobots})}>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.respectRobots ? 'bg-green-600' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.respectRobots ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium">Respect Robots.txt</div>
                                                    <div className="text-[10px] text-[#666]">Strictly adhere to disallow rules and crawl delays.</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group mb-4" onClick={() => setConfig({...config, ignoreQueryParams: !config?.ignoreQueryParams})}>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.ignoreQueryParams ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.ignoreQueryParams ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium">Ignore Query Parameters</div>
                                                    <div className="text-[10px] text-[#666]">Strip ?session=123 from URLs to prevent duplicate crawling.</div>
                                                </div>
                                            </label>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Path Rules</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Include Paths (Regex)</label>
                                                    <textarea value={config?.includeRules || ''} onChange={e => setConfig({...config, includeRules: e.target.value})} placeholder="^/blog/.*" className="w-full h-20 bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono custom-scrollbar" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Exclude Paths (Regex)</label>
                                                    <textarea value={config?.excludeRules || ''} onChange={e => setConfig({...config, excludeRules: e.target.value})} placeholder={"^/admin/.*\n.*\\.pdf$"} className="w-full h-20 bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono custom-scrollbar" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {settingsTab === 'ai' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4 mb-4">
                                            <div className="flex items-center gap-2 text-blue-400 mb-1"><Wand2 size={16}/> <strong>AI Features</strong></div>
                                            <p className="text-[11px] text-blue-200/70">Turn on AI analysis to automatically categorize your content, detect topics, and find similar pages across your site.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg cursor-pointer" onClick={() => setConfig({...config, generateEmbeddings: !config?.generateEmbeddings})}>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium mb-0.5">Detect Topics & Similarities</div>
                                                    <div className="text-[10px] text-[#666]">Create vector representations for every page. Requires high CPU or external API.</div>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${config?.generateEmbeddings ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.generateEmbeddings ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg cursor-pointer" onClick={() => setConfig({...config, aiCategorization: !config?.aiCategorization})}>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium mb-0.5">Auto-Categorize Content</div>
                                                    <div className="text-[10px] text-[#666]">Automatically group pages into topic clusters.</div>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${config?.aiCategorization ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.aiCategorization ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg cursor-pointer" onClick={() => setConfig({...config, aiSentiment: !config?.aiSentiment})}>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium mb-0.5">Sentiment Analysis</div>
                                                    <div className="text-[10px] text-[#666]">Analyze the emotional tone and intent of page content.</div>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${config?.aiSentiment ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.aiSentiment ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {settingsTab === 'integrations' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="bg-[#101010] border border-[#222] rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-white text-[13px] font-semibold mb-1">
                                                <Network size={15} className="text-[#F5364E]" />
                                                Data Connections
                                            </div>
                                            <p className="text-[11px] text-[#666] leading-relaxed">
                                                Connect first-party search data directly, then enrich crawls with backlink providers. Credentials are currently stored locally in this browser until cloud sync is introduced.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-white">Google Search Console</div>
                                                        <div className="text-[11px] text-[#666] mt-1">Authenticate once, then discover the Search Console properties and GA4 properties that account can access.</div>
                                                    </div>
                                                    {integrationConnections.googleSearchConsole ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-[#d5d5d5] border border-white/10">Connected</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]">Not Connected</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Preferred Site URL</label>
                                                    {googleSites.length > 0 ? (
                                                        <select
                                                            value={config?.gscSiteUrl || googleSites[0]}
                                                            onChange={e => setConfig({ ...config, gscSiteUrl: e.target.value })}
                                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none"
                                                        >
                                                            {googleSites.map((site) => (
                                                                <option key={site} value={site}>{site}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={config?.gscSiteUrl || ''}
                                                            onChange={e => setConfig({ ...config, gscSiteUrl: e.target.value })}
                                                            placeholder="https://www.example.com/ or sc-domain:example.com"
                                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => {
                                                            if (!hasGoogleOAuthConfig) {
                                                                addLog('Google OAuth is not configured. Add a valid VITE_GOOGLE_CLIENT_ID and authorize this origin in Google Cloud Console.', 'error');
                                                                return;
                                                            }
                                                            connectGoogleData();
                                                        }}
                                                        className="px-4 py-2 bg-[#F5364E] text-white text-[11px] font-semibold rounded-lg hover:bg-[#e02d43] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        disabled={!hasGoogleOAuthConfig || googleLoading}
                                                    >
                                                        {integrationConnections.googleSearchConsole ? (googleLoading ? 'Refreshing...' : 'Reconnect Google') : 'Connect Google'}
                                                    </button>
                                                    {config?.gscApiKey && (
                                                        <button
                                                            onClick={() => loadGoogleWorkspaceData(config?.gscApiKey || '')}
                                                            className="px-4 py-2 bg-[#151515] border border-[#2a2a2a] text-[#bbb] text-[11px] font-semibold rounded-lg hover:text-white hover:border-[#3a3a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                            disabled={googleLoading}
                                                        >
                                                            Refresh Properties
                                                        </button>
                                                    )}
                                                    {integrationConnections.googleSearchConsole && (
                                                        <button
                                                            onClick={() => {
                                                                removeIntegrationConnection('googleSearchConsole');
                                                                removeIntegrationConnection('googleAnalytics');
                                                                setGoogleSites([]);
                                                                setGaProperties([]);
                                                                setConfig({ ...config, gscApiKey: '', gscSiteUrl: '', ga4PropertyId: '' });
                                                            }}
                                                            className="px-4 py-2 bg-[#151515] border border-[#2a2a2a] text-[#bbb] text-[11px] font-semibold rounded-lg hover:text-white hover:border-[#3a3a3a] transition-colors"
                                                        >
                                                            Disconnect
                                                        </button>
                                                    )}
                                                </div>
                                                {integrationConnections.googleSearchConsole?.accountLabel && (
                                                    <div className="text-[11px] text-[#777] flex flex-wrap gap-3">
                                                        <span>Connected as {integrationConnections.googleSearchConsole.accountLabel}</span>
                                                        {integrationConnections.googleSearchConsole.sync?.lastSyncedAt && (
                                                            <span>Synced {new Date(integrationConnections.googleSearchConsole.sync.lastSyncedAt).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {googleSites.length > 0 && (
                                                    <div className="text-[11px] text-[#777]">
                                                        {googleSites.length} Search Console propert{googleSites.length === 1 ? 'y' : 'ies'} discovered for this account.
                                                    </div>
                                                )}
                                                {!hasGoogleOAuthConfig ? (
                                                    <div className="text-[11px] text-amber-500/90 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 mt-2 space-y-1">
                                                        {googleAuthDiagnostics.issues.map((issue) => (
                                                            <div key={issue}>{issue}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-[#6f6f6f] bg-[#0e0e0e] p-2.5 rounded border border-[#1d1d1d]">
                                                        OAuth origin: <code className="text-[#d4d4d4] ml-0.5">{googleAuthDiagnostics.origin}</code>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-white">Google Analytics 4</div>
                                                        <div className="text-[11px] text-[#666] mt-1">Use the authenticated Google account to select the GA4 property this crawler should enrich against.</div>
                                                    </div>
                                                    {integrationConnections.googleAnalytics ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-[#d5d5d5] border border-white/10">Connected</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]">Needs Google Auth</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">GA4 Property</label>
                                                    {gaProperties.length > 0 ? (
                                                        <select
                                                            value={config?.ga4PropertyId || gaProperties[0]?.id || ''}
                                                            onChange={e => setConfig({ ...config, ga4PropertyId: e.target.value })}
                                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none"
                                                        >
                                                            {gaProperties.map((property) => (
                                                                <option key={property.id} value={property.id}>{property.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={config?.ga4PropertyId || ''}
                                                            onChange={e => setConfig({ ...config, ga4PropertyId: e.target.value })}
                                                            placeholder="123456789"
                                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono"
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-[#777]">
                                                    {integrationConnections.googleAnalytics?.accountLabel
                                                        ? `Using ${integrationConnections.googleAnalytics.accountLabel}${gaProperties.length ? ` with ${gaProperties.length} discovered GA4 properties.` : '.'}`
                                                        : 'Connect Google first, then choose the GA4 property you want this crawler to use.'}
                                                </div>
                                                {integrationConnections.googleAnalytics?.sync?.coverageLabel && (
                                                    <div className="text-[11px] text-[#777]">{integrationConnections.googleAnalytics.sync.coverageLabel}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-[13px] font-semibold text-white">Bing Webmaster</div>
                                                    {integrationConnections.bingWebmaster ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-[#d5d5d5] border border-white/10">Configured</span>
                                                    ) : null}
                                                </div>
                                                <p className="text-[11px] text-[#666]">Authenticate with Bing directly when Microsoft app credentials are configured on both the frontend and crawler server. Manual token entry still works as a fallback.</p>
                                                <input
                                                    type="password"
                                                    value={config?.bingAccessToken || ''}
                                                    onChange={e => setConfig({ ...config, bingAccessToken: e.target.value })}
                                                    placeholder="Bing access token"
                                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => beginBingOAuth()}
                                                        disabled={!hasBingOAuthConfig || bingLoading}
                                                        className="w-full px-4 py-2 bg-[#005a9c] border border-[#0e6fbf] text-white text-[11px] font-semibold rounded-lg hover:bg-[#0b67af] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        {bingLoading ? 'Connecting Bing...' : 'Connect Bing Directly'}
                                                    </button>
                                                    <button
                                                        onClick={() => saveManualIntegration('bingWebmaster', 'Bing Webmaster', 'token', { accessToken: config?.bingAccessToken || '' }, { authReadiness: bingClientId ? 'oauth-client-present' : 'token-only' })}
                                                        disabled={!config?.bingAccessToken}
                                                        className="w-full px-4 py-2 bg-[#151515] border border-[#2a2a2a] text-[#ddd] text-[11px] font-semibold rounded-lg hover:text-white hover:border-[#3a3a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        Save Manual Token
                                                    </button>
                                                </div>
                                                <div className="text-[10px] text-[#6d6d6d] leading-relaxed bg-[#0e0e0e] border border-[#1d1d1d] rounded p-2">
                                                    {hasBingOAuthConfig ? (
                                                        <div>Redirect URI: <code className="text-[#bfbfbf]">{bingAuthDiagnostics.redirectUri}</code></div>
                                                    ) : (
                                                        bingAuthDiagnostics.issues.map((issue) => (
                                                            <div key={issue}>{issue}</div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-[13px] font-semibold text-white">Ahrefs</div>
                                                    {integrationConnections.ahrefs ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-[#d5d5d5] border border-white/10">Configured</span>
                                                    ) : null}
                                                </div>
                                                <p className="text-[11px] text-[#666]">Import backlink domains and URL rating data via API token or CSV export. CSV remains the most reliable route for bulk page-level enrichment.</p>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="password"
                                                        value={config?.ahrefsToken || ''}
                                                        onChange={e => setConfig({ ...config, ahrefsToken: e.target.value })}
                                                        placeholder="Ahrefs API token"
                                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono"
                                                    />
                                                    <label className="flex items-center justify-center gap-2 w-full bg-[#151515] border border-dashed border-[#444] rounded-lg p-2 text-[11px] text-[#888] hover:text-white hover:border-[#666] transition-colors cursor-pointer">
                                                        <Upload size={12} /> Upload Ahrefs CSV
                                                        <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleCsvUpload(e.target.files[0], 'ahrefs');
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                                <button
                                                    onClick={() => saveManualIntegration('ahrefs', 'Ahrefs API', 'token', { apiToken: config?.ahrefsToken || '' }, { dataset: 'backlinks_api' })}
                                                    disabled={!config?.ahrefsToken}
                                                    className="w-full px-4 py-2 bg-[#1a1122] border border-[#3a205a] text-[#ddd] text-[11px] font-semibold rounded-lg hover:text-white hover:border-[#522b82] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Save Ahrefs Token
                                                </button>
                                            </div>

                                            <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-[13px] font-semibold text-white">SEMrush</div>
                                                    {integrationConnections.semrush ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-[#d5d5d5] border border-white/10">Configured</span>
                                                    ) : null}
                                                </div>
                                                <p className="text-[11px] text-[#666]">Import backlink profiles and toxicity markers via API key or CSV export. CSV is still the safest path for broad backlink merges.</p>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="password"
                                                        value={config?.semrushApiKey || ''}
                                                        onChange={e => setConfig({ ...config, semrushApiKey: e.target.value })}
                                                        placeholder="SEMrush API key"
                                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono"
                                                    />
                                                    <label className="flex items-center justify-center gap-2 w-full bg-[#151515] border border-dashed border-[#444] rounded-lg p-2 text-[11px] text-[#888] hover:text-white hover:border-[#666] transition-colors cursor-pointer">
                                                        <Upload size={12} /> Upload SEMrush CSV
                                                        <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleCsvUpload(e.target.files[0], 'semrush');
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                                <button
                                                    onClick={() => saveManualIntegration('semrush', 'SEMrush API', 'token', { apiKey: config?.semrushApiKey || '' }, { dataset: 'backlinks_api' })}
                                                    disabled={!config?.semrushApiKey}
                                                    className="w-full px-4 py-2 bg-[#221008] border border-[#522610] text-[#ddd] text-[11px] font-semibold rounded-lg hover:text-white hover:border-[#863e19] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Save SEMrush Token
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-[11px] text-[#ccc] uppercase tracking-widest mb-1.5"><Wand2 size={12}/> OpenAI API Key</label>
                                            <input type="password" value={config?.openAiKey || ''} onChange={e => setConfig({...config, openAiKey: e.target.value})} placeholder="sk-..." className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                            <p className="text-[10px] text-[#555] mt-1">Needed for AI Auto-Fix, topic detection, and content rewriting.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {settingsTab === 'auth' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">HTTP Authentication</h4>
                                            <p className="text-[11px] text-[#666] mb-4">Set credentials if the site you're crawling requires Basic Auth or custom headers.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Username</label>
                                                    <input type="text" value={config?.authUser || ''} onChange={e => setConfig({...config, authUser: e.target.value})} placeholder="admin" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Password</label>
                                                    <input type="password" value={config?.authPass || ''} onChange={e => setConfig({...config, authPass: e.target.value})} placeholder="••••••" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Custom Headers</h4>
                                            <textarea value={config?.customHeaders || ''} onChange={e => setConfig({...config, customHeaders: e.target.value})} placeholder={"Authorization: Bearer token123\nX-Custom-Header: value"} className="w-full h-24 bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono custom-scrollbar" />
                                            <p className="text-[10px] text-[#555] mt-1">One header per line in the format: Header-Name: value</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Custom Cookies</h4>
                                            <textarea value={config?.customCookies || ''} onChange={e => setConfig({...config, customCookies: e.target.value})} placeholder={"session_id=abc123; path=/\nauth_token=xyz789; path=/"} className="w-full h-20 bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono custom-scrollbar" />
                                        </div>
                                    </div>
                                )}

                                {settingsTab === 'proxies' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Proxy Configuration</h4>
                                            <label className="flex items-center gap-3 cursor-pointer group mb-4" onClick={() => setConfig({...config, useProxy: !config?.useProxy})}>
                                                <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.useProxy ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.useProxy ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-[12px] text-white font-medium">Route Crawl Through Proxy</div>
                                                    <div className="text-[10px] text-[#666]">Useful for geo-targeted crawls or avoiding IP blocks.</div>
                                                </div>
                                            </label>
                                            {config?.useProxy && (
                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Proxy Host</label>
                                                        <input type="text" value={config?.proxyUrl || ''} onChange={e => setConfig({...config, proxyUrl: e.target.value})} placeholder="proxy.example.com" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Port</label>
                                                        <input type="text" value={config?.proxyPort || ''} onChange={e => setConfig({...config, proxyPort: e.target.value})} placeholder="8080" className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Username (optional)</label>
                                                        <input type="text" value={config?.proxyUser || ''} onChange={e => setConfig({...config, proxyUser: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Password (optional)</label>
                                                        <input type="password" value={config?.proxyPass || ''} onChange={e => setConfig({...config, proxyPass: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none font-mono" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {settingsTab === 'scheduling' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="bg-[#F5364E]/10 border border-[#F5364E]/20 rounded p-4 mb-4">
                                            <div className="flex items-center gap-2 text-[#F5364E] mb-1"><Calendar size={16}/> <strong>Automated Scheduling</strong></div>
                                            <p className="text-[11px] text-[#F5364E]/70">Set up recurring crawls to track SEO health over time. Requires sign-in for cloud-based scheduling.</p>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer group mb-4" onClick={() => setConfig({...config, scheduleEnabled: !config?.scheduleEnabled})}>
                                            <div className={`w-10 h-5 rounded-full transition-colors relative ${config?.scheduleEnabled ? 'bg-[#F5364E]' : 'bg-[#333]'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config?.scheduleEnabled ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                            <div>
                                                <div className="text-[12px] text-white font-medium">Enable Scheduled Crawls</div>
                                                <div className="text-[10px] text-[#666]">Automatically re-crawl at your chosen frequency.</div>
                                            </div>
                                        </label>
                                        {config?.scheduleEnabled && (
                                            <div className="space-y-4 animate-in fade-in">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Frequency</label>
                                                        <select value={scheduleFrequency} onChange={e => setScheduleFrequency(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none">
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="biweekly">Every 2 Weeks</option>
                                                            <option value="monthly">Monthly</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Time</label>
                                                        <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none" />
                                                    </div>
                                                </div>
                                                {scheduleFrequency === 'weekly' && (
                                                    <div>
                                                        <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">Day of Week</label>
                                                        <select value={scheduleDay} onChange={e => setScheduleDay(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded p-2 text-[12px] text-white focus:border-[#F5364E] focus:outline-none">
                                                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                                                                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <label className="flex items-center gap-3 cursor-pointer" onClick={() => setScheduleNotify(!scheduleNotify)}>
                                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${scheduleNotify ? 'bg-green-600' : 'bg-[#333]'}`}>
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${scheduleNotify ? 'right-1' : 'left-1'}`}></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] text-white font-medium">Email Notifications</div>
                                                        <div className="text-[10px] text-[#666]">Get notified when a scheduled crawl finishes or finds new issues.</div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {settingsTab === 'display' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div>
                                            <h4 className="text-[12px] font-bold text-white mb-4 border-b border-[#222] pb-2">Appearance</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] text-[#888] uppercase tracking-widest mb-1.5">User Interface Theme</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'dark', label: 'Dark Mode', desc: 'Sleek & Professional' },
                                                            { id: 'light', label: 'Light Mode', desc: 'Classic & Clear' },
                                                            { id: 'high-contrast', label: 'High Contrast', desc: 'Enhanced Visibility' },
                                                            { id: 'system', label: 'System Default', desc: 'Sync with OS' }
                                                        ].map(t => (
                                                            <button 
                                                                key={t.id}
                                                                onClick={() => setTheme(t.id as any)}
                                                                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${theme === t.id ? 'bg-[#F5364E]/10 border-[#F5364E] ring-1 ring-[#F5364E]/50' : 'bg-[#111] border-[#333] hover:border-[#444]'}`}
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={`text-[12px] font-bold ${theme === t.id ? 'text-[#F5364E]' : 'text-white'}`}>{t.label}</span>
                                                                    {theme === t.id && <CheckCircle2 size={12} className="text-[#F5364E]" />}
                                                                </div>
                                                                <span className="text-[10px] text-[#666]">{t.desc}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-[60px] border-t border-[#222] bg-[#141414] flex items-center justify-between px-6 shrink-0">
                                <button onClick={() => setConfig({...config, limit: ''})} className="text-[12px] text-[#666] hover:text-white transition-colors">Reset to Defaults</button>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                                    <button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-[#F5364E] text-white text-[12px] font-bold rounded hover:bg-[#e02d43] transition-colors flex items-center gap-2">
                                        <CheckCircle2 size={14}/> Save Configuration
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {showAutoFixModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isFixing && setShowAutoFixModal(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[#222] flex justify-between items-center bg-[#141414]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#F5364E]/10 flex items-center justify-center">
                                    <Wand2 size={16} className="text-[#F5364E]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Auto-Fix</h3>
                                    <p className="text-[11px] text-[#888]">Generating Missing Meta Descriptions</p>
                                </div>
                            </div>
                            {!isFixing && <button onClick={() => setShowAutoFixModal(false)} className="text-gray-500 hover:text-white"><XCircle size={20}/></button>}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a] custom-scrollbar space-y-4">
                            {autoFixItems?.length === 0 ? (
                                <div className="text-center py-12 text-[#666]">
                                    <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
                                    <p>No missing meta descriptions found!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {autoFixItems?.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-[#111] border border-[#222] rounded-lg p-4 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="text-[12px] text-blue-400 truncate mb-1">{item.url}</div>
                                                    <div className="text-[14px] font-bold text-[#e0e0e0] truncate">{item.title || 'Untitled Page'}</div>
                                                    <div className="text-[11px] text-[#666] mt-1 flex items-center gap-2">
                                                        <span className="bg-[#222] px-1.5 py-0.5 rounded">H1: {item.h1_1 || 'None'}</span>
                                                        <span>• {item.wordCount} words</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex flex-col items-end">
                                                    {item.fixStatus === 'pending' && <span className="px-2 py-1 bg-[#222] text-[#888] rounded text-[10px] font-bold uppercase tracking-wider">Queued</span>}
                                                    {item.fixStatus === 'generating' && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/> Generating</span>}
                                                    {item.fixStatus === 'done' && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10}/> Ready</span>}
                                                </div>
                                            </div>
                                            
                                            {item.fixStatus !== 'pending' && (
                                                <div className="mt-3 pt-3 border-t border-[#222]">
                                                    <label className="text-[10px] text-[#555] uppercase tracking-widest font-bold mb-1 block">Generated Meta Description</label>
                                                    {item.fixStatus === 'generating' ? (
                                                        <div className="h-10 bg-[#1a1a1a] rounded animate-pulse border border-[#333]"></div>
                                                    ) : (
                                                        <div className="relative">
                                                            <textarea 
                                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-[12px] text-[#ccc] focus:border-[#F5364E] focus:outline-none min-h-[60px] custom-scrollbar"
                                                                value={item.generatedMeta}
                                                                onChange={(e) => {
                                                                    const newItems = [...autoFixItems];
                                                                    newItems[idx].generatedMeta = e.target.value;
                                                                    setAutoFixItems(newItems);
                                                                }}
                                                            />
                                                            <div className={`absolute bottom-2 right-2 text-[10px] font-mono ${(item.generatedMeta?.length || 0) > 155 ? 'text-red-400' : 'text-[#666]'}`}>
                                                                {item.generatedMeta?.length || 0}/155
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-[#222] bg-[#141414] flex justify-between items-center">
                            <div className="flex-1 pr-8">
                                {isFixing && (
                                    <div>
                                        <div className="flex justify-between text-[10px] text-[#888] mb-1 uppercase tracking-widest">
                                            <span>Progress</span>
                                            <span>{Math.round(autoFixProgress)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F5364E] transition-all duration-300" style={{width: `${autoFixProgress}%`}}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button 
                                    onClick={() => setShowAutoFixModal(false)} 
                                    disabled={isFixing}
                                    className="px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {autoFixItems?.some((i: any) => i.fixStatus === 'done') ? 'Close' : 'Cancel'}
                                </button>
                                
                                {autoFixItems?.length > 0 && !autoFixItems.every((i: any) => i.fixStatus === 'done') && (
                                    <button 
                                        onClick={async () => {
                                            setIsFixing(true);
                                            const total = autoFixItems.length;
                                            
                                            for (let i = 0; i < total; i++) {
                                                setAutoFixItems((prev: any) => {
                                                    const next = [...prev];
                                                    next[i].fixStatus = 'generating';
                                                    return next;
                                                });
                                                
                                                await new Promise(r => setTimeout(r, 1200));
                                                
                                                const title = autoFixItems[i].title || 'this page';
                                                const h1 = autoFixItems[i].h1_1 || '';
                                                const generated = `Discover comprehensive insights on ${title}. ${h1 ? `Learn about ${h1} and ` : ''}Explore our detailed guide to enhance your strategy and drive better results.`;
                                                
                                                setAutoFixItems((prev: any) => {
                                                    const next = [...prev];
                                                    next[i].fixStatus = 'done';
                                                    next[i].generatedMeta = generated;
                                                    return next;
                                                });
                                                
                                                setAutoFixProgress(((i + 1) / total) * 100);
                                            }
                                            
                                            setIsFixing(false);
                                            
                                            setPages((prevPages: any) => {
                                                const updated = [...prevPages];
                                                autoFixItems.forEach((fixedItem: any, idx: number) => {
                                                    const pIdx = updated.findIndex((p: any) => p.url === fixedItem.url);
                                                    if (pIdx >= 0) {
                                                        updated[pIdx] = { 
                                                            ...updated[pIdx], 
                                                            metaDesc: autoFixItems[idx]?.generatedMeta || updated[pIdx].metaDesc,
                                                            metaDescLength: (autoFixItems[idx]?.generatedMeta || '').length 
                                                        };
                                                    }
                                                });
                                                return updated;
                                            });
                                        }}
                                        disabled={isFixing}
                                        className="px-6 py-2 bg-[#F5364E] text-white text-[12px] font-bold rounded hover:bg-[#e02d43] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isFixing ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> Generating...</> : 'Generate All with AI'}
                                    </button>
                                )}

                                {autoFixItems?.length > 0 && autoFixItems.every((i: any) => i.fixStatus === 'done') && (
                                    <button 
                                        onClick={() => {
                                            alert('Queued for CMS Push! (Mock functionality)');
                                            setShowAutoFixModal(false);
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white text-[12px] font-bold rounded hover:bg-green-500 transition-colors flex items-center gap-2"
                                    >
                                        <Database size={14} /> Queue for CMS Push
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
