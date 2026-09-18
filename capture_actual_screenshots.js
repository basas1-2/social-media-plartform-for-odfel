const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const imgDir = path.join(__dirname, 'chapter3_images');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

async function capture() {
    console.log('Launching browser to capture actual website screenshots...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const pagesToCapture = [
        { url: 'http://localhost:5000/login', name: 'figure_3_6_actual_login_page.png' },
        { url: 'http://localhost:5000/register', name: 'figure_3_7_actual_register_page.png' },
        { url: 'http://localhost:5000/', name: 'figure_3_8_actual_home_feed.png' },
        { url: 'http://localhost:5000/resources', name: 'figure_3_9_actual_resource_hub.png' },
        { url: 'http://localhost:5000/admin', name: 'figure_3_10_actual_admin_dashboard.png' }
    ];

    for (const p of pagesToCapture) {
        try {
            console.log(`Navigating to ${p.url}...`);
            await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 10000 });
            const savePath = path.join(imgDir, p.name);
            await page.screenshot({ path: savePath, fullPage: false });
            console.log(`Saved screenshot: ${p.name}`);
        } catch (err) {
            console.warn(`Failed to capture ${p.url}: ${err.message}`);
        }
    }

    await browser.close();
    console.log('Finished capturing website screenshots!');
}

capture();
