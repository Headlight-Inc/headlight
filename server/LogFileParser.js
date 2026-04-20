// server/LogFileParser.js

class LogFileParser {
	static parse(content, format = "auto") {
		const lines = content.split("\n");
		const results = [];

		// Basic Common Log Format regex
		// 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.0" 200 2326
		const commonRegex =
			/^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+|-)/;

		// Cloudflare Log Format (approximate)
		// {"ClientRequestURI":"/","ClientRequestHost":"example.com","ClientIP":"1.1.1.1",...}

		for (const line of lines) {
			if (!line.trim()) continue;

			let match;
			if (line.startsWith("{")) {
				try {
					const json = JSON.parse(line);
					results.push({
						ip: json.ClientIP || json.ip,
						timestamp: json.Timestamp || json.time,
						method: json.ClientRequestMethod || json.method,
						url: json.ClientRequestURI || json.url,
						status: parseInt(json.EdgeResponseStatus || json.status),
						userAgent: json.ClientRequestUserAgent || json.userAgent,
					});
					continue;
				} catch (e) {}
			}

			if ((match = line.match(commonRegex))) {
				results.push({
					ip: match[1],
					timestamp: match[2],
					method: match[3],
					url: match[4],
					status: parseInt(match[5]),
					userAgent: line.split('"').slice(-2, -1)[0], // Rough UA extraction
				});
			}
		}

		return results;
	}

	static identifyBots(logs) {
		const botData = {
			googlebot: [],
			bingbot: [],
			yandex: [],
			baidu: [],
			duckduckbot: [],
			gptbot: [],
			claudebot: [],
			perplexity: [],
		};

		for (const entry of logs) {
			const ua = (entry.userAgent || "").toLowerCase();
			if (ua.includes("googlebot")) botData.googlebot.push(entry);
			else if (ua.includes("bingbot")) botData.bingbot.push(entry);
			else if (ua.includes("yandex")) botData.yandex.push(entry);
			else if (ua.includes("baidu")) botData.baidu.push(entry);
			else if (ua.includes("duckduckbot")) botData.duckduckbot.push(entry);
			else if (ua.includes("gptbot")) botData.gptbot.push(entry);
			else if (ua.includes("claudebot")) botData.claudebot.push(entry);
			else if (ua.includes("perplexity")) botData.perplexity.push(entry);
		}

		return botData;
	}

	static aggregateStats(botLogs) {
		const stats = {};
		for (const [bot, logs] of Object.entries(botLogs)) {
			const urlCounts = {};
			let totalRequests = logs.length;
			let statusCodes = {};

			for (const log of logs) {
				urlCounts[log.url] = (urlCounts[log.url] || 0) + 1;
				statusCodes[log.status] = (statusCodes[log.status] || 0) + 1;
			}

			stats[bot] = {
				totalRequests,
				urlCounts,
				statusCodes,
			};
		}
		return stats;
	}
}

export default LogFileParser;
