const hashScore = (value: string, min: number, max: number) => {
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return min + (hash % (max - min + 1));
};

export const generateContentPrediction = async (topic: string) => {
    const base = hashScore(topic, 58, 92);
    return {
        score: base,
        intent: base > 78 ? 'Commercial' : base > 68 ? 'Informational' : 'Transactional',
        volume: hashScore(topic + ':volume', 800, 12000),
        difficulty: hashScore(topic + ':difficulty', 22, 79),
        outline: [
            { h2: `What ${topic} actually solves`, subtopics: ['Core use cases', 'Who benefits most', 'Common mistakes'] },
            { h2: `How to evaluate ${topic}`, subtopics: ['Decision criteria', 'Budget tradeoffs', 'Implementation constraints'] },
            { h2: `Best practices for ${topic}`, subtopics: ['Quick wins', 'Long-term strategy', 'Measurement approach'] }
        ],
        recommendations: [
            'Target a sharper search intent in the title and intro.',
            'Add comparison-driven subheads and decision criteria.',
            'Strengthen proof points, examples, and implementation depth.'
        ]
    };
};

export const generateDashboardInsights = async (projectName: string, projectUrl: string) => {
    const score = hashScore(`${projectName}:${projectUrl}`, 49, 86);
    const trendValue = hashScore(projectName, 3, 18);
    return {
        visibility: {
            overallScore: score,
            trend: trendValue % 2 === 0 ? 'up' : 'down',
            trendValue
        },
        insights: [
            {
                title: 'Strengthen commercial landing pages',
                detail: 'Your highest-opportunity pages are under-supported by internal links and intent-specific copy.'
            },
            {
                title: 'Turn branded mentions into links',
                detail: 'Recent references can be converted into authority if outreach is run while mentions are fresh.'
            },
            {
                title: 'Recrawl recent losers first',
                detail: 'Pages with rising impressions and falling CTR should be reworked before broad sitewide changes.'
            }
        ]
    };
};
