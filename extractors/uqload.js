async function extractUqload(url) {
    try {
        if (url.startsWith('//')) url = 'https:' + url;
        const response = await fetch(url);
        if (!response.ok) return null;
        const html = await response.text();
        
        const match = html.match(/sources:\s*\["(.*?)"\]/);
        if (match) {
            return match[1];
        }
        return null;
    } catch (e) {
        console.error('[Uqload] Extraction error:', e);
        return null;
    }
}
module.exports = extractUqload;