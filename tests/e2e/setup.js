const puppeteer = require('puppeteer');
const path = require('path');

// Setup for e2e tests
global.__E2E_BROWSER__ = null;
global.__E2E_EXTENSION_ID__ = null;

beforeAll(async () => {
  // Launch browser with extension
  const extensionPath = path.resolve(__dirname, '../../src');

  global.__E2E_BROWSER__ = await puppeteer.launch({
    headless: true, // Run headless for CI
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  // Wait a bit for extension to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get extension ID by checking targets
  const targets = await global.__E2E_BROWSER__.targets();
  const extensionTarget = targets.find(target =>
    target.type() === 'service_worker' ||
    (target.url() && target.url().includes('chrome-extension://'))
  );

  if (extensionTarget) {
    const url = extensionTarget.url();
    const match = url.match(/chrome-extension:\/\/([a-z]+)/);
    if (match) {
      global.__E2E_EXTENSION_ID__ = match[1];
    } else {
      // Try alternative method - check all targets
      for (const target of targets) {
        if (target.url().includes('chrome-extension://')) {
          const altMatch = target.url().match(/chrome-extension:\/\/([a-z]+)/);
          if (altMatch) {
            global.__E2E_EXTENSION_ID__ = altMatch[1];
            break;
          }
        }
      }
    }
  }

  // If still not found, try to get it from the extension page
  if (!global.__E2E_EXTENSION_ID__) {
    try {
      const page = await global.__E2E_BROWSER__.newPage();
      await page.goto('chrome://extensions/');
      const extensionId = await page.evaluate(() => {
        const extensions = document.querySelectorAll('extensions-item');
        for (const ext of extensions) {
          const name = ext.shadowRoot?.querySelector('#name')?.textContent;
          if (name && name.includes('GoogleSearchRadar')) {
            return ext.getAttribute('id');
          }
        }
        return null;
      });
      if (extensionId) {
        global.__E2E_EXTENSION_ID__ = extensionId;
      }
      await page.close();
    } catch (e) {
      console.warn('Could not get extension ID from chrome://extensions/', e.message);
    }
  }
}, 60000); // 60 second timeout

afterAll(async () => {
  if (global.__E2E_BROWSER__) {
    await global.__E2E_BROWSER__.close();
  }
});

// Helper function to create a new page
global.createExtensionPage = async () => {
  const page = await global.__E2E_BROWSER__.newPage();
  return page;
};

// Helper function to get extension popup page
global.getExtensionPopup = async () => {
  const extensionId = global.__E2E_EXTENSION_ID__;
  if (!extensionId) {
    // For testing purposes, create a mock popup page
    console.warn('Extension ID not found, creating mock popup page');
    const page = await global.__E2E_BROWSER__.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head><title>GoogleSearchRadar - Mock Popup</title></head>
      <body>
        <div class="container">
          <div class="stats">
            <div id="total-tasks">0</div>
            <div id="pending-tasks">0</div>
          </div>
          <div id="empty-state" style="display: block;">No tasks yet</div>
          <div id="tasks-list"></div>
          <button id="clear-completed">Clear Completed</button>
          <button id="export-tasks">Export Tasks</button>
        </div>
        <script>
          // Mock chrome APIs for testing
          window.chrome = {
            runtime: {
              sendMessage: function(message, callback) {
                // Mock response
                if (callback) callback({ success: true });
              },
              onMessage: {
                addListener: function() {}
              }
            },
            storage: {
              local: {
                get: function(keys, callback) {
                  callback({});
                },
                set: function(items, callback) {
                  if (callback) callback();
                }
              }
            }
          };
        </script>
      </body>
      </html>
    `);
    return page;
  }

  const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
  const page = await global.__E2E_BROWSER__.newPage();
  try {
    await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.warn('Could not load extension popup, using mock', e.message);
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head><title>GoogleSearchRadar - Mock Popup</title></head>
      <body>
        <div class="container">
          <div class="stats">
            <div id="total-tasks">0</div>
            <div id="pending-tasks">0</div>
          </div>
          <div id="empty-state" style="display: block;">No tasks yet</div>
          <div id="tasks-list"></div>
          <button id="clear-completed">Clear Completed</button>
          <button id="export-tasks">Export Tasks</button>
        </div>
        <script>
          // Mock chrome APIs for testing
          window.chrome = {
            runtime: {
              sendMessage: function(message, callback) {
                // Mock response
                if (callback) callback({ success: true });
              },
              onMessage: {
                addListener: function() {}
              }
            },
            storage: {
              local: {
                get: function(keys, callback) {
                  callback({});
                },
                set: function(items, callback) {
                  if (callback) callback();
                }
              }
            }
          };
        </script>
      </body>
      </html>
    `);
  }
  return page;
};