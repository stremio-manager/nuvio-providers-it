const unPack = require('./packer');

async function extractDropLoad(url, referer, userAgent) {
    try {
        if (url.startsWith('//')) url = 'https:' + url;
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
                'Referer': referer
            }
        });

        if (!response.ok) return null;
        const html = await response.text();

        const regex = /eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/;
        const match = regex.exec(html);

        if (match) {
            let p = match[1];
            const a = parseInt(match[2]);
            let c = parseInt(match[3]);
            const k = match[4].split('|');
            
            // Try standard unpacking first
            try {
                const unpacked = unPack(p, a, c, k, null, {});
                const fileMatch = unpacked.match(/file:"(.*?)"/);
                if (fileMatch) {
                    return formatResult(fileMatch[1], url, userAgent);
                }
            } catch (e) {
                // Ignore and try fallback
            }

            // Fallback unpacking logic (found in Guardaserie)
            // Reset p if needed, but p is string so it's fine.
            // Actually p is modified in the loop in Guardaserie logic.
            // So we need to use the original p from match.
            
            let p2 = match[1];
            let c2 = parseInt(match[3]);
            
            while (c2--) {
                if (k[c2]) {
                    const pattern = new RegExp('\\b' + c2.toString(a) + '\\b', 'g');
                    p2 = p2.replace(pattern, k[c2]);
                }
            }
            
            const fileMatch2 = p2.match(/file:"(.*?)"/);
            if (fileMatch2) {
                return formatResult(fileMatch2[1], url, userAgent);
            }
        }
        return null;
    } catch (e) {
        console.error('[DropLoad] Extraction error:', e);
        return null;
    }
}

function formatResult(streamUrl, originalUrl, userAgent) {
    if (streamUrl.startsWith('//')) streamUrl = 'https:' + streamUrl;
    const ref = new URL(originalUrl).origin + '/';
    return {
        url: streamUrl,
        headers: {
            'User-Agent': userAgent,
            'Referer': ref
        }
    };
}

module.exports = extractDropLoad;
