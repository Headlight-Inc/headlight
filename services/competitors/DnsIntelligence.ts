import { CompetitorProfile } from '../CompetitorMatrixConfig';

const CDN_MAP: Record<string, string> = {
  cloudflare: 'Cloudflare',
  cloudfront: 'AWS CloudFront',
  akamai: 'Akamai',
  fastly: 'Fastly',
  cdn77: 'CDN77',
  stackpath: 'StackPath',
  sucuri: 'Sucuri',
  incapsula: 'Imperva/Incapsula',
  edgecast: 'Edgecast/Edgio',
  azureedge: 'Azure CDN',
  googleusercontent: 'Google Cloud CDN',
};

const HOSTING_MAP: Record<string, string> = {
  amazonaws: 'AWS', aws: 'AWS',
  google: 'Google Cloud', googlehosted: 'Google Cloud',
  azure: 'Microsoft Azure',
  digitalocean: 'DigitalOcean',
  linode: 'Linode/Akamai',
  vultr: 'Vultr',
  hetzner: 'Hetzner',
  ovh: 'OVH',
  godaddy: 'GoDaddy',
  bluehost: 'Bluehost',
  siteground: 'SiteGround',
  wpengine: 'WP Engine',
  shopify: 'Shopify',
  squarespace: 'Squarespace',
  wix: 'Wix',
  netlify: 'Netlify',
  vercel: 'Vercel',
  fly: 'Fly.io',
  render: 'Render',
  railway: 'Railway',
  heroku: 'Heroku',
};

const EMAIL_MAP: Record<string, string> = {
  google: 'Google Workspace', aspmx: 'Google Workspace',
  outlook: 'Microsoft 365', microsoft: 'Microsoft 365',
  zoho: 'Zoho Mail',
  protonmail: 'ProtonMail',
  mimecast: 'Mimecast',
  barracuda: 'Barracuda',
  messagelabs: 'Broadcom/Symantec',
  pphosted: 'Proofpoint',
  secureserver: 'GoDaddy Email',
  emailsrvr: 'Rackspace Email',
  fastmail: 'Fastmail',
  icloud: 'Apple iCloud',
  yandex: 'Yandex Mail',
};

interface DnsAnswer { name: string; type: number; data: string; TTL: number; }

async function queryDns(name: string, type: string): Promise<DnsAnswer[]> {
  try {
    const resp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.Answer || [];
  } catch {
    return [];
  }
}

function matchMap(value: string, map: Record<string, string>): string | null {
  const lower = value.toLowerCase();
  for (const [key, label] of Object.entries(map)) {
    if (lower.includes(key)) return label;
  }
  return null;
}

export async function getDnsIntelligence(domain: string): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const cleanDomain = domain.replace(/^www\./, '');

  const [cnameAnswers, aAnswers, mxAnswers] = await Promise.all([
    queryDns(`www.${cleanDomain}`, 'CNAME'),
    queryDns(cleanDomain, 'A'),
    queryDns(cleanDomain, 'MX'),
  ]);

  for (const answer of cnameAnswers) {
    const cdn = matchMap(answer.data, CDN_MAP);
    if (cdn) {
      result.cdnProvider = cdn;
      break;
    }
  }

  if (!result.cdnProvider) {
    for (const answer of cnameAnswers) {
      const host = matchMap(answer.data, HOSTING_MAP);
      if (host) {
        result.hostingProvider = host;
        break;
      }
    }
  }

  if (!result.hostingProvider && aAnswers.length > 0) {
    const ip = aAnswers[0].data;
    try {
      const ipResp = await fetch(`http://ip-api.com/json/${ip}?fields=org,isp,as`, {
        signal: AbortSignal.timeout(5000),
      });
      if (ipResp.ok) {
        const ipData = await ipResp.json();
        const orgStr = `${ipData.org || ''} ${ipData.isp || ''} ${ipData.as || ''}`;
        result.hostingProvider = matchMap(orgStr, HOSTING_MAP) || ipData.org || null;
      }
    } catch {
      // ignore ip lookup failure
    }
  }

  for (const answer of mxAnswers) {
    const email = matchMap(answer.data, EMAIL_MAP);
    if (email) {
      result.emailProvider = email;
      break;
    }
  }

  return result;
}
