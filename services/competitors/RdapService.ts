import { CompetitorProfile } from "../CompetitorMatrixConfig";

export async function getDomainIntel(
	domain: string,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const cleanDomain = domain.replace(/^www\./, "");
	const tld = cleanDomain.split(".").pop() || "";

	let rdapBase = "https://rdap.org";
	try {
		const bootstrapResp = await fetch("https://data.iana.org/rdap/dns.json", {
			signal: AbortSignal.timeout(5000),
		});
		if (bootstrapResp.ok) {
			const bootstrap = await bootstrapResp.json();
			for (const entry of bootstrap.services || []) {
				if (entry[0]?.includes(tld)) {
					rdapBase = String(entry[1][0]).replace(/\/$/, "");
					break;
				}
			}
		}
	} catch {
		// fallback to rdap.org
	}

	try {
		const resp = await fetch(`${rdapBase}/domain/${cleanDomain}`, {
			headers: { Accept: "application/rdap+json,application/json" },
			signal: AbortSignal.timeout(8000),
		});
		if (!resp.ok) return result;

		const data = await resp.json();

		if (Array.isArray(data.events)) {
			for (const event of data.events) {
				if (event.eventAction === "registration") {
					const regDate = new Date(event.eventDate);
					const ageYears =
						(Date.now() - regDate.getTime()) / (365.25 * 86400000);
					result.domainAge = Math.round(ageYears * 10) / 10;
					result.firstSeenDate = regDate.toISOString().split("T")[0];
					break;
				}
			}
		}

		if (Array.isArray(data.entities)) {
			for (const entity of data.entities) {
				if (entity.roles?.includes("registrant") && entity.vcardArray) {
					const vcard = entity.vcardArray[1] || [];
					for (const field of vcard) {
						if (field[0] === "org") {
							result.businessName = field[3] || null;
							break;
						}
					}
				}
			}
		}
	} catch {
		// ignore RDAP failures
	}

	return result;
}
