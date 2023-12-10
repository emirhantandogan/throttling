const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set viewport to a specific size
    await page.setViewport({ width: 1280, height: 720 });

    const client = await page.target().createCDPSession();

    const networkConditions = {
        'None': null,
        'Slow 3G': {
            'offline': false,
            'downloadThroughput': 500 * 1024 / 8,
            'uploadThroughput': 500 * 1024 / 8,
            'latency': 500
        },
        'Fast 3G': {
            'offline': false,
            'downloadThroughput': 1.5 * 1024 * 1024 / 8,
            'uploadThroughput': 750 * 1024 / 8,
            'latency': 150
        }
    };

    await page.goto('http://127.0.0.1:8080/demo/');

    // Dropdown Menu
    await page.evaluate((networkConditions) => {
        const select = document.createElement('select');
        select.id = 'networkConditionSelector';
        Object.keys(networkConditions).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.innerText = key;
            select.appendChild(option);
        });

        select.style.position = 'fixed';
        select.style.top = '10px';
        select.style.left = '10px';
        select.style.zIndex = '10000';

        document.body.appendChild(select);
    }, networkConditions);

    // Listen for network condition changes from the page
    await page.exposeFunction('onNetworkConditionChange', async (condition) => {
        if (networkConditions[condition]) {
            await client.send('Network.emulateNetworkConditions', networkConditions[condition]);
            console.log(`Network conditions set to ${condition}`);
        }
    });

    await page.evaluate(() => {
        const selector = document.getElementById('networkConditionSelector');
        selector.onchange = (event) => {
            window.onNetworkConditionChange(event.target.value);
        };
    });

    // Keep the browser open indefinitely
    await new Promise(resolve => {});
}

run();


/*

const puppeteer = require('puppeteer');

async function run()
{
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    const client = await page.target().createCDPSession();
    
    const networkConditions = {
        'Slow 3G': {
            'offline': false,
            'downloadThroughput': 500 * 1024 / 8, // 500 Kbps in bytes per second
            'uploadThroughput': 500 * 1024 / 8, // 500 Kbps in bytes per second
            'latency': 500 // 500 ms
        },
        'Fast 3G': {
            'offline': false,
            'downloadThroughput': 1.5 * 1024 * 1024 / 8, // 1.5 Mbps in bytes per second
            'uploadThroughput': 750 * 1024 / 8, // 750 Kbps in bytes per second
            'latency': 150 // 150 ms
        }
    };

    await client.send('Network.emulateNetworkConditions', networkConditions['Fast 3G'])
    
    await page.tracing.start({ path: 'profile.json' ,screenshots: true});

    await page.goto('http://127.0.0.1:8080/demo/');
    //await page.screenshot({path: 'screenshot.png'});

    await page.waitForTimeout(10000);


    await page.tracing.stop();
    const metrics = await page.metrics();
    console.info(metrics);
    
    
    
    //await browser.close();
}

run();
*/