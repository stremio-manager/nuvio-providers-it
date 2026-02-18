const unPack = require('./packer');

async function extractDeltaBit(url) {
    try {
        if (url.startsWith('//')) url = 'https:' + url;
        const response = await fetch(url);
        if (!response.ok) return null;
        const html = await response.text();
        
        const packedRegex = /eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/;
        const match = packedRegex.exec(html);

        if (match) {
            const p = match[1];
            const a = parseInt(match[2]);
            const c = parseInt(match[3]);
            const k = match[4].split('|');
            const unpacked = unPack(p, a, c, k, null, {});
            
            const fileMatch = unpacked.match(/file:\s*"(.*?)"/);
            if (fileMatch) {
                return fileMatch[1];
            }
        }
        return null;
    } catch (e) {
        console.error('[DeltaBit] Extraction error:', e);
        return null;
    }
}
module.exports = extractDeltaBit;