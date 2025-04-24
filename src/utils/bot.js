const { chromium } = require('playwright');

async function startBot(meetingUrl, session) {
  console.log('startBot called with meetingUrl:', meetingUrl);

  const browser = await chromium.launch({ 
    headless: false,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--disable-features=PreloadMediaEngagementData,AutoplayIgnoreWebAudio,MediaEngagementBypassAutoplayPolicies'
    ]
  });
  
  const context = await browser.newContext({
    permissions: ['microphone', 'camera'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to meeting URL:', meetingUrl);
    await page.goto(meetingUrl);
    
    // Vänta på att sidan laddas helt
    await page.waitForLoadState('networkidle');
    
    // Stäng av mikrofon och kamera innan vi går in
    const micButton = await page.waitForSelector('button[aria-label*="microphone"], button[aria-label*="mikrofon"]', { timeout: 5000 }).catch(() => null);
    const camButton = await page.waitForSelector('button[aria-label*="camera"], button[aria-label*="kamera"]', { timeout: 5000 }).catch(() => null);
    
    if (micButton) await micButton.click();
    if (camButton) await camButton.click();
    
    // Vänta lite så att UI hinner uppdateras
    await page.waitForTimeout(2000);

    // Försök ansluta till mötet
    const joinButtons = [
      'button:has-text("Join now")',
      'button:has-text("Ask to join")',
      'button:has-text("Delta nu")',
      'button:has-text("Be om att få delta")',
      '[jsname="Qx7uuf"]',
      '[role="button"]:has-text("Join")',
      '[role="button"]:has-text("Delta")'
    ];

    for (const selector of joinButtons) {
      try {
        const button = await page.waitForSelector(selector, { timeout: 2000 });
        if (button) {
          console.log('Found join button with selector:', selector);
          await button.click();
          console.log('Clicked join button');
          break;
        }
      } catch (e) {
        console.log(`Button not found with selector: ${selector}`);
      }
    }

    // Vänta på bekräftelse att vi är i mötet
    await page.waitForSelector('[data-meeting-title]', { timeout: 10000 })
      .then(() => console.log('Successfully joined meeting'))
      .catch(() => console.log('Could not confirm meeting join'));

    // Behåll webbläsaren öppen
    return browser;

  } catch (error) {
    console.error('Bot Error:', error);
    await browser.close();
    throw error;
  }
}

module.exports = { startBot };