const https = require('https');
const fs = require('fs');
const path = require('path');

// Use the stable mirror for China
const cssUrl = 'https://fonts.loli.net/css2?family=Caveat:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Zhi+Mang+Xing&display=swap';
const fontsDir = path.join(__dirname, 'fonts');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir);
}

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
};

https.get(cssUrl, { headers }, (res) => {
    let css = '';
    res.on('data', d => css += d);
    res.on('end', () => {
        const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map(m => m[1]);
        let count = 0;
        
        console.log(`Found ${urls.length} font files to download...`);

        if (urls.length === 0) {
            console.log('No fonts found or failed to fetch CSS properly.');
            return;
        }

        urls.forEach((url, i) => {
            const ext = url.split('.').pop() || 'woff2';
            const filename = `font-${i}.${ext}`;
            
            // Replace remote URL with local path in CSS
            css = css.replace(url, `./fonts/${filename}`);
            
            const download = (attempt = 1) => {
                https.get(url, (fontRes) => {
                    const file = fs.createWriteStream(path.join(fontsDir, filename));
                    fontRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        count++;
                        if (count === urls.length) {
                            fs.writeFileSync('local-fonts.css', css);
                            console.log('All fonts downloaded and local-fonts.css generated successfully!');
                        }
                    });
                }).on('error', (err) => {
                    if (attempt <= 3) {
                        console.log(`Error downloading ${filename}, retrying (${attempt}/3)...`);
                        download(attempt + 1);
                    } else {
                        console.error(`Error downloading ${url} after 3 attempts:`, err.message);
                    }
                });
            };
            
            download();
        });
    });
}).on('error', (err) => {
    console.error('Error fetching Google Fonts CSS:', err.message);
});
