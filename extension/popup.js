
// Ensure compatibility for Chrome and Firefox
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
  window.chrome = browser;
}

document.addEventListener('DOMContentLoaded', function() {
  const addBtn = document.getElementById('add');
  if (addBtn) {
    addBtn.onclick = function() {
      const links = document.getElementById('links').value.split('\n').map(s => s.trim()).filter(Boolean);
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'addToCart', links });
      } else {
        alert('Extension messaging API not available.');
      }
    };
  }
});
