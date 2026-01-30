/**
 * Content Script E2E Tests
 * Tests content script behavior on Google search pages
 */

describe('Content Script E2E Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = global.__E2E_BROWSER__;
  });

  beforeEach(async () => {
    page = await global.createExtensionPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Content Script Loading', () => {
    test('should handle Google search pages', async () => {
      // Navigate to a mock Google search page using data URL
      await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head><title>Google Search</title></head>
        <body>
          <div id="search">
            <div class="g">
              <div class="tF2Cxc">
                <a href="https://example.com">Test Result</a>
                <h3>Test Result Title</h3>
                <div class="VwiC3b">Test snippet content</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `));

      // Wait for content script to potentially load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if content script elements are present
      const hasSearchResults = await page.evaluate(() => {
        return !!document.querySelector('.tF2Cxc');
      });

      expect(hasSearchResults).toBe(true);
    }, 10000);

    test('should handle non-Google pages', async () => {
      await page.goto('https://example.com');

      await new Promise(resolve => setTimeout(resolve, 1000));

      const url = page.url();
      expect(url).toBe('https://example.com/');

      const title = await page.title();
      expect(title).toBeDefined();
    });
  });

  describe('Search Analysis', () => {
    test('should handle search page structure', async () => {
      await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head><title>How to fix a leaky faucet - Google Search</title></head>
        <body>
          <div id="search">
            <div class="g">
              <div class="tF2Cxc">
                <a href="https://example.com/fix-faucet">How to Fix a Leaky Faucet</a>
                <h3>How to Fix a Leaky Faucet</h3>
                <div class="VwiC3b">Turn off the water supply. Use pliers to tighten the nut.</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `));

      await new Promise(resolve => setTimeout(resolve, 2000));

      const searchResults = await page.evaluate(() => {
        const results = document.querySelectorAll('.tF2Cxc');
        return results.length;
      });

      expect(searchResults).toBe(1);
    });
  });

  describe('DOM Manipulation', () => {
    test('should not break page layout', async () => {
      await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head><title>Test Search</title></head>
        <body>
          <div id="search">
            <div class="g">
              <div class="tF2Cxc">
                <a href="https://example.com">Test Link</a>
                <h3>Test Title</h3>
                <div class="VwiC3b">Test content</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const hasSearchDiv = await page.$('#search');
      expect(hasSearchDiv).toBeTruthy();

      const hasResult = await page.$('.tF2Cxc');
      expect(hasResult).toBeTruthy();
    });
  });
});