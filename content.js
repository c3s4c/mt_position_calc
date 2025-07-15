
function createCalculatorUI() {
  const SYMBOL_INFO = {
    "XAUUSD": { pip: 0.1, lotSize: 100 },
    "XAGUSD": { pip: 0.01, lotSize: 5000 },
    "USOIL":  { pip: 0.01, lotSize: 100 },
    "WTI":    { pip: 0.01, lotSize: 100 },
    "SPX":    { pip: 1, lotSize: 1 },
    "NAS100": { pip: 1, lotSize: 1 },
    "DJI":    { pip: 1, lotSize: 1 },
    "GER30":  { pip: 1, lotSize: 1 },
    "UK100":  { pip: 1, lotSize: 1 }
  };

  const panel = document.createElement('div');
  panel.id = 'lot-calculator';
  panel.innerHTML = `
    <div id="header" style="cursor: move; background:#444; color:white; padding:5px; border-radius: 8px 8px 0 0;">📊 محاسبه‌گر حجم معامله</div>
    <div style="padding:10px;">
      <label>سرمایه ($): <input type="number" id="capital" /></label><br/>
      <label>ریسک (%): <input type="number" id="risk" /></label><br/>
      <label>استاپ لاس (پیپ): <input type="number" id="stop" /></label><br/>
      <label>قیمت: <input type="number" id="price" readonly /></label><br/>
      <label>جفت‌ارز: <input type="text" id="pair" readonly /></label><br/>
      <button id="calcBtn">محاسبه</button>
      <div id="result" style="margin-top:10px; color:blue;"></div>
    </div>
  `;

  panel.style.position = 'fixed';
  panel.style.top = '100px';
  panel.style.right = '20px';
  panel.style.width = '300px';
  panel.style.background = 'rgba(255,255,255,0.95)';
  panel.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
  panel.style.border = '1px solid #aaa';
  panel.style.borderRadius = '8px';
  panel.style.zIndex = '99999';
  panel.style.fontFamily = 'tahoma, sans-serif';
  panel.style.userSelect = 'none';

  document.body.appendChild(panel);

  // Drag functionality
  let isDragging = false, offsetX, offsetY;
  const header = document.getElementById("header");
  header.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });
  document.addEventListener("mouseup", () => isDragging = false);
  document.addEventListener("mousemove", e => {
    if (isDragging) {
      panel.style.left = (e.clientX - offsetX) + "px";
      panel.style.top = (e.clientY - offsetY) + "px";
      panel.style.right = "auto";
    }
  });

  function updatePriceAndPair() {
    const activeRow = document.querySelector("tr.item.active");
    if (!activeRow) return;

    const pair = activeRow.getAttribute("title");
    const bidElem = activeRow.querySelectorAll(".value.price")[0];
    if (!bidElem) return;

    const price = parseFloat(bidElem.innerText.replace(/\s/g, ""));
    document.getElementById("pair").value = pair;
    document.getElementById("price").value = price;
  }

  function updateBalance() {
    const divs = document.querySelectorAll(".layout.svelte-1w81fi8 > div");
    for (let div of divs) {
      if (div.innerText.includes("Balance")) {
        const balance = parseFloat(div.innerText.split(":")[1].replace(/\s|\$/g, ""));
        if (!isNaN(balance)) {
          document.getElementById("capital").value = balance;
        }
        break;
      }
    }
  }

  setInterval(updatePriceAndPair, 2000);
  setTimeout(updateBalance, 3000);

  document.getElementById('calcBtn').onclick = () => {
    const capital = parseFloat(document.getElementById('capital').value);
    const risk = parseFloat(document.getElementById('risk').value);
    const stop = parseFloat(document.getElementById('stop').value);
    const price = parseFloat(document.getElementById('price').value);
    const pair = document.getElementById('pair').value.toUpperCase();

    if (isNaN(capital) || isNaN(risk) || isNaN(stop) || isNaN(price)) {
      document.getElementById('result').innerText = 'ورودی ناقص یا نادرست است.';
      return;
    }

    let pip, lotSize;
    let warning = "";

    if (SYMBOL_INFO[pair]) {
      pip = SYMBOL_INFO[pair].pip;
      lotSize = SYMBOL_INFO[pair].lotSize;
    } else if (pair.endsWith("USD")) {
      pip = pair.includes("JPY") ? 0.01 : 0.0001;
      lotSize = 100000;
    } else {
      pip = pair.includes("JPY") ? 0.01 : 0.0001;
      lotSize = 100000;
      warning = "\n⚠️ این جفت‌ارز USD ندارد، محاسبه تقریبی است.";
    }

    const pip_value_per_lot = (pip * lotSize) / price;
    const risk_amount = capital * (risk / 100);
    const pip_value_needed = risk_amount / stop;
    const position_lot = pip_value_needed / pip_value_per_lot;

    document.getElementById('result').innerText =
      `📌 حجم مناسب: ${position_lot.toFixed(3)} لات\n💰 ریسک دلاری: ${risk_amount.toFixed(2)} دلار${warning}`;
  };
}

window.addEventListener("load", () => {
  setTimeout(createCalculatorUI, 3000);
});
