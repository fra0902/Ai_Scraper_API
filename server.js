import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cors from 'cors';

// Initialize Puppeteer with Stealth Plugin to avoid bot detection
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Constants
const PERPLEXITY_URL = 'https://www.perplexity.ai';
const INPUT_SELECTOR = '#ask-input';
const COPY_BUTTON_SELECTOR = 'button[aria-label*="Copy"]';
const RESPONSE_CONTAINER_SELECTOR = '.prose';

/**
 * Optimized Browser Launch Arguments
 */
const BROWSER_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-size=1280,800',
    '--disable-extensions',
    '--disable-notifications',
    '--disable-background-networking',
    '--disable-default-apps',
    '--mute-audio',
    '--disable-gpu',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, error: "Question is required" });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: BROWSER_ARGS
    });

    try {
        const page = await browser.newPage();

        // Intercept requests to block heavy/useless resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'font', 'media'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        console.log(`Navigating to ${PERPLEXITY_URL}...`);
        await page.goto(PERPLEXITY_URL, { waitUntil: 'domcontentloaded' });

        // Wait for the input field to be ready
        await page.waitForSelector(INPUT_SELECTOR, { timeout: 20000 });

        // Focus, type the question and submit
        await page.click(INPUT_SELECTOR);
        await page.keyboard.type(question);
        await page.keyboard.press('Enter');

        console.log('Question sent. Waiting for AI response...');

        // Wait for the "Copy" button to appear (indicates completion)
        await page.waitForSelector(COPY_BUTTON_SELECTOR, { timeout: 60000 });

        // Brief delay to ensure the DOM is fully updated
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract the final answer
        const answer = await page.evaluate((selector) => {
            const elements = Array.from(document.querySelectorAll(selector));
            // Filter out empty containers and pick the last one (most recent)
            const validMessages = elements.filter(el => el.innerText.trim().length > 0);
            return validMessages.length > 0 ? validMessages[validMessages.length - 1].innerText : null;
        }, RESPONSE_CONTAINER_SELECTOR);

        await browser.close();

        console.log('Response successfully retrieved.');
        res.json({ success: true, answer });

    } catch (error) {
        console.error("CRITICAL ERROR: ", error.message);
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 AI Scraper Server running!
📍 Endpoint: http://localhost:${PORT}/ask
🛠️ Mode: Headless (Background)
    `);
});