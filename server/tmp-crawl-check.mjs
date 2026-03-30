import { runCrawler } from './crawler.js';

const events = [];
const crawler = runCrawler(
    {
        startUrls: ['https://6yka.com/'],
        mode: 'spider',
        threads: 2,
        crawlSpeed: 'normal',
        respectRobots: true,
        jsRendering: false
    },
    (event, payload) => {
        if (['LOG', 'PAGE_CRAWLED', 'CRAWL_FINISHED', 'ERROR'].includes(event)) {
            events.push({ event, payload });
        }

        if (event === 'CRAWL_FINISHED') {
            console.log(JSON.stringify({
                linkLogs: events.filter(e => e.event === 'LOG' && String(e.payload?.message || '').includes('Link Analysis')).slice(0, 10),
                pages: events.filter(e => e.event === 'PAGE_CRAWLED').slice(0, 10).map(e => e.payload.url),
                finished: payload,
                errors: events.filter(e => e.event === 'ERROR').slice(0, 10)
            }, null, 2));
            crawler.stop().catch(() => {});
            setTimeout(() => process.exit(0), 200);
        }
    }
);

setTimeout(() => {
    console.log(JSON.stringify({
        timeout: true,
        recent: events.slice(-20)
    }, null, 2));
    crawler.stop().catch(() => {});
    setTimeout(() => process.exit(1), 200);
}, 30000);
