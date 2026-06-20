const https = require('https');
const fs = require('fs');

function download(url, dest) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url}...`);
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        };

        https.get(url, options, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // follow redirect once
                console.log('Following redirect to: ' + response.headers.location);
                return https.get(response.headers.location, options, (redirectResponse) => {
                    redirectResponse.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
            }
            
            response.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function run() {
    try {
        await download('https://upload.wikimedia.org/wikipedia/commons/c/c0/Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait.png', 'd:/CMPortal/delhi-cm-portal/frontend/public/pm_modi.png');
        await download('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg', 'd:/CMPortal/delhi-cm-portal/frontend/public/emblem.svg');
        await download('https://dummyimage.com/150x200/e2e8f0/475569.png&text=CM+Rekha+Gupta', 'd:/CMPortal/delhi-cm-portal/frontend/public/cm_rekha_gupta.png');
        console.log("Downloads complete!");
    } catch (e) {
        console.error("Error downloading:", e);
    }
}
run();
