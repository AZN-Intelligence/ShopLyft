// Listens for custom events from the frontend and relays them to the extension background


// Listen for the custom event dispatched by the frontend
window.addEventListener('shoplyft-add-to-cart', (e) => {
  console.log('[ShopLyft Extension] Received shoplyft-add-to-cart event:', e);
  if (e.detail && e.detail.links) {
    console.log('[ShopLyft Extension] Sending addToCart message to background with links:', e.detail.links);
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'addToCart', links: e.detail.links });
    } else {
      console.warn('[ShopLyft Extension] chrome.runtime.sendMessage is not available in this context.');
    }
  } else {
    console.warn('[ShopLyft Extension] Event missing detail or links:', e);
  }
});
