// Listens for custom events from the frontend and relays them to the extension background

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(
    "[ShopLyft Extension] Received message from background:",
    message
  );
  try {
    if (message.action === "showNotification") {
      console.log(
        "[ShopLyft Extension] Showing notification with message:",
        message.message
      );
      showSlideOutNotification(message.message);
    } else {
      console.log(
        "[ShopLyft Extension] Unknown message action:",
        message.action
      );
    }
  } catch (error) {
    console.warn("[ShopLyft Extension] Error handling message:", error);
  }
});

// Function to show slide-out notification
function showSlideOutNotification(message) {
  console.log(
    "[ShopLyft Extension] showSlideOutNotification called with message:",
    message
  );
  console.log("[ShopLyft Extension] Document body exists:", !!document.body);

  // Create slide-out notification element
  const notification = document.createElement("div");
  console.log(
    "[ShopLyft Extension] Created notification element:",
    notification
  );
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: -400px;
      width: 350px;
      background: white;
      color: #333;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid #f97316;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: right 0.3s ease-in-out;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">✅</div>
        <div>
          <div style="font-weight: 600; font-size: 16px; color: #f97316;">ShopLyft</div>
          <div style="font-size: 14px; color: #666;">${message}</div>
        </div>
      </div>
    </div>
  `;

  console.log("[ShopLyft Extension] Appending notification to document body");
  document.body.appendChild(notification);
  console.log(
    "[ShopLyft Extension] Notification appended, element in DOM:",
    document.body.contains(notification)
  );

  // Slide in
  setTimeout(() => {
    console.log("[ShopLyft Extension] Sliding notification in");
    notification.firstElementChild.style.right = "20px";
  }, 100);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    console.log("[ShopLyft Extension] Sliding notification out");
    notification.firstElementChild.style.right = "-400px";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        console.log("[ShopLyft Extension] Removing notification from DOM");
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Listen for the custom event dispatched by the frontend
window.addEventListener("shoplyft-add-to-cart", (e) => {
  console.log("[ShopLyft Extension] Received shoplyft-add-to-cart event:", e);
  if (e.detail && e.detail.links) {
    console.log(
      "[ShopLyft Extension] Sending addToCart message to background with links:",
      e.detail.links
    );
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      chrome.runtime.sendMessage(
        {
          action: "addToCart",
          links: e.detail.links,
        },
        (response) => {
          console.log(
            "[ShopLyft Extension] Background script response:",
            response
          );
        }
      );
    } else {
      console.warn(
        "[ShopLyft Extension] chrome.runtime.sendMessage is not available in this context."
      );
    }
  } else {
    console.warn("[ShopLyft Extension] Event missing detail or links:", e);
  }
});

// Test function to manually trigger notification (for debugging)
window.testNotification = function () {
  console.log("[ShopLyft Extension] Manual test notification triggered");
  showSlideOutNotification("Test notification - All items added to cart!");
};
