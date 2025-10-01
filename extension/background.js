// Receives messages from the content script and automates adding products to cart
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received in background:", message);
  if (message.action === "addToCart" && Array.isArray(message.links)) {
    let completed = 0;
    const total = message.links.length;
    const originalTabId = sender.tab.id; // Store the original tab ID

    message.links.forEach((link, idx) => {
      chrome.tabs.create({ url: link, active: false }, (tab) => {
        // Wait for the tab to finish loading before injecting the script
        const listener = (tabId, changeInfo, updatedTab) => {
          if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["inject-add-to-cart.js"],
              },
              () => {
                completed++;
                if (completed === total) {
                  // Send notification message to the original tab
                  chrome.tabs
                    .sendMessage(originalTabId, {
                      action: "showNotification",
                      message: "All items added to cart!",
                    })
                    .catch((error) => {
                      console.log(
                        "Could not send notification to original tab:",
                        error
                      );
                    });

                  // Also show system notification as fallback
                  if (chrome.notifications) {
                    chrome.notifications.create({
                      type: "basic",
                      iconUrl: "https://www.google.com/favicon.ico",
                      title: "ShopLyft",
                      message: "All items have been added to your cart!",
                    });
                  }
                  console.log("All items have been added to your cart!");
                }
              }
            );
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }
});
