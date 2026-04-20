/**
 * AgentRegistry.js
 * Registry and scheduler for all agents
 */

import { executeAgent } from "./AgentFramework.js";
import { completeAI, aiBatch } from "../aiGateway.js";

// Import Agents
import { IssueFixerAgent } from "./IssueFixerAgent.js";
import { ContentMonitorAgent } from "./ContentMonitorAgent.js";
import { RankGuardAgent } from "./RankGuardAgent.js";
import { LinkWatcherAgent } from "./LinkWatcherAgent.js";
import { TrafficAnalystAgent } from "./TrafficAnalystAgent.js";
import { CompetitorScoutAgent } from "./CompetitorScoutAgent.js";
import { OutreachBotAgent } from "./OutreachBotAgent.js";

export const AGENT_REGISTRY = new Map();

// Register All Agents
registerAgent(IssueFixerAgent);
registerAgent(ContentMonitorAgent);
registerAgent(RankGuardAgent);
registerAgent(LinkWatcherAgent);
registerAgent(TrafficAnalystAgent);
registerAgent(CompetitorScoutAgent);
registerAgent(OutreachBotAgent);

/**
 * Register an agent definition
 */
export function registerAgent(agentDef) {
	if (!agentDef.id) throw new Error("Agent must have an ID");
	AGENT_REGISTRY.set(agentDef.id, agentDef);
	console.log(`[AgentRegistry] Registered agent: ${agentDef.id}`);
}

/**
 * Helper to check if an agent should run based on its schedule
 */
function shouldRunAgent(agentDef, projectId, lastRun) {
	if (agentDef.trigger !== "cron") return false;

	const now = new Date();
	const lastRunDate = lastRun ? new Date(lastRun.started_at) : null;

	// Check cooldown from definition
	if (lastRunDate && agentDef.cooldownMs) {
		if (now.getTime() - lastRunDate.getTime() < agentDef.cooldownMs) {
			return false;
		}
	}

	const schedule = agentDef.schedule || "daily";

	if (schedule === "daily") {
		// If it hasn't run today, and it's after the preferred hour (default 2 AM if not specified)
		if (lastRunDate && lastRunDate.toDateString() === now.toDateString())
			return false;

		// Check if we are past the target hour (0-23)
		const targetHour = agentDef.targetHour || 2;
		return now.getHours() >= targetHour;
	}

	if (schedule === "weekly") {
		// If it hasn't run in the last 6 days
		if (
			lastRunDate &&
			now.getTime() - lastRunDate.getTime() < 6 * 24 * 60 * 60 * 1000
		)
			return false;

		const dayMap = {
			sunday: 0,
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
		};
		const targetDayStr = agentDef.scheduleDay || "monday";
		const targetDay = dayMap[targetDayStr.toLowerCase()];

		if (now.getDay() !== targetDay) return false;

		const targetHour = agentDef.targetHour || 3;
		return now.getHours() >= targetHour;
	}

	return false;
}

/**
 * Runs all agents that are due based on their cron schedule
 */
export async function runDueAgents(turso) {
	console.log("[AgentRegistry] Checking for due agents...");

	try {
		// Query projects that have agents enabled implicitly or explicitly
		// We use projects where auto_crawl is enabled as our list of "active" projects
		const projectsRes = await turso.execute(
			"SELECT id FROM projects WHERE auto_crawl_enabled = 1",
		);
		const projects = projectsRes.rows;

		for (const project of projects) {
			const projectId = String(project.id);

			for (const [agentId, agentDef] of AGENT_REGISTRY.entries()) {
				if (agentDef.trigger !== "cron") continue;

				// Get last run for this specific agent/project
				const lastRunRes = await turso.execute({
					sql: "SELECT started_at FROM agent_runs WHERE project_id = ? AND agent_id = ? ORDER BY started_at DESC LIMIT 1",
					args: [projectId, agentId],
				});
				const lastRun = lastRunRes.rows[0];

				if (shouldRunAgent(agentDef, projectId, lastRun)) {
					console.log(
						`[AgentRegistry] Agent ${agentId} is due for project ${projectId}`,
					);
					await executeAgent(agentDef, projectId, turso, completeAI, aiBatch);
				}
			}
		}
	} catch (err) {
		console.error("[AgentRegistry] Error running due agents:", err);
	}
}

/**
 * Runs agents triggered by specific system events (e.g., crawl.completed)
 */
export async function runAgentByEvent(turso, eventType, eventData) {
	const { projectId } = eventData;
	console.log(
		`[AgentRegistry] Checking event-based agents for "${eventType}" on project ${projectId}`,
	);

	for (const [agentId, agentDef] of AGENT_REGISTRY.entries()) {
		if (agentDef.trigger === "event" && agentDef.event === eventType) {
			console.log(
				`[AgentRegistry] Triggering agent ${agentId} due to event ${eventType}`,
			);
			await executeAgent(agentDef, projectId, turso, completeAI, aiBatch);
		}
	}
}
