// This script runs in the context of the product page
// You must update selectors for each store's site

function waitForAddToCartAndClick() {
  const tryClick = () => {
    const wcAddToCart = document.querySelector('wc-add-to-cart');
    const colesAddToCart = document.querySelector('[data-testid="add-to-cart-button"]');
    const aldiAddToCart = document.querySelector('[data-testid="add-to-cart-button"]') || 
                         document.querySelector('.add-to-cart-button') ||
                         document.querySelector('button[class*="add-to-cart"]');
    
    if (wcAddToCart && wcAddToCart.shadowRoot) {
      const btn = wcAddToCart.shadowRoot.querySelector('.add-to-cart-btn');
      console.log('[ShopLyft] Checking for add-to-cart button in shadow DOM:', btn);
      if (btn) {
        btn.click();
        console.log('[ShopLyft] Clicked add-to-cart button in shadow DOM!');
        return true;
      }
    } else if (colesAddToCart) {
        colesAddToCart.click();
        console.log('[ShopLyft] Clicked add-to-cart button for Coles!');
        return true;
    } else if (aldiAddToCart) {
        aldiAddToCart.click();
        console.log('[ShopLyft] Clicked add-to-cart button for ALDI!');
        return true;
    }
    return false;
  };

  if (!tryClick()) {
    const observer = new MutationObserver(() => {
      if (tryClick()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

waitForAddToCartAndClick();
