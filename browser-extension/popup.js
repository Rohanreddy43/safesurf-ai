document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeUrlEl = document.getElementById('activeUrl');
  const scanBtn = document.getElementById('scanBtn');
  const resultEl = document.getElementById('result');

  if (tab && tab.url) {
    activeUrlEl.textContent = tab.url;
  }

  scanBtn.addEventListener('click', async () => {
    if (!tab || !tab.url) return;
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    resultEl.textContent = 'Analyzing URL across 10 security modules...';

    try {
      const resp = await fetch('http://localhost:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url })
      });
      const data = await resp.json();
      resultEl.innerHTML = `
        <div style="padding:10px; background:#1e293b; border-radius:8px;">
          <strong>Trust Score:</strong> ${data.risk_score}/100<br/>
          <strong>Status:</strong> <span style="color:${data.status === 'safe' ? '#4ade80' : '#f43f5e'}">${data.status.toUpperCase()}</span>
        </div>
      `;
    } catch (err) {
      resultEl.textContent = 'Failed to connect to SafeSurf AI backend service.';
    } finally {
      scanBtn.disabled = false;
      scanBtn.textContent = 'Scan Active Tab';
    }
  });
});
