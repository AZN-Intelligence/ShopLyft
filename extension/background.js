// Receives messages from the content script and automates adding products to cart
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received in background:', message);
  if (message.action === 'addToCart' && Array.isArray(message.links)) {
    let completed = 0;
    const total = message.links.length;
    message.links.forEach((link, idx) => {
      chrome.tabs.create({ url: link, active: false }, (tab) => {
        // Wait for the tab to finish loading before injecting the script
        const listener = (tabId, changeInfo, updatedTab) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['inject-add-to-cart.js']
            }, () => {
              completed++;
              if (completed === total) {
                // Show notification when all items are added
                if (chrome.notifications) {
                  chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'https://www.google.com/favicon.ico',
                    title: 'ShopLyft',
                    message: 'All items have been added to your cart!'
                  });
                }
                console.log('All items have been added to your cart!');
              }
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }
});
