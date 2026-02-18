async function extractStreamTape(url) {
    try {
        if (url.startsWith('//')) url = 'https:' + url;
        const response = await fetch(url);
        if (!response.ok) return null;
        const html = await response.text();

        const match = html.match(/document\.getElementById\('robotlink'\)\.innerHTML = '(.*?)'/);
        if (match) {
            // Better regex for the whole line to catch concatenation
            const lineMatch = html.match(/document\.getElementById\('robotlink'\)\.innerHTML = (.*);/);
            if (lineMatch) {
                const raw = lineMatch[1];
                const cleanLink = raw.replace(/['"\+\s]/g, '');
                if (cleanLink.startsWith('//')) return 'https:' + cleanLink;
                if (cleanLink.startsWith('http')) return cleanLink;
            }
        }
        return null;
    } catch (e) {
        console.error('[StreamTape] Extraction error:', e);
        return null;
    }
}
module.exports = extractStreamTape;