/* ตรวจ "องค์ประกอบภาพ" ของฉากหน้า Home ด้วยตัวเลข — ไม่ใช่ด้วยคำว่าสวย
   รัน:  node skins/_check-scene.js home-kintsugi.svg
         node skins/_check-scene.js --all

   ทำไมมีไฟล์นี้
   ─────────────
   งานวาดในเรโปนี้พังซ้ำที่เรื่องเดียวกันทุกครั้ง: "รายละเอียดเยอะแต่จัดวางไม่เป็น"
   และคำว่า "สวยขึ้นหน่อย" ไม่มีทางส่งต่อให้ AI ตัวถัดไปทำตามได้
   ไฟล์นี้จึงแปลงข้อที่เคยโดนตีกลับจริงเป็นเกณฑ์ที่วัดจากพิกเซล+เรขาคณิตได้
   ผ่านครบ = ยังไม่แปลว่าสวย แต่ ไม่ผ่าน = สวยไม่ได้แน่นอน อย่าเพิ่งส่งงาน

   เกณฑ์ด้านล่างวัด hierarchy, safe area, foreground และ contrast
   ต้องติดตั้ง puppeteer-core ด้วย npm install */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME_PATH || "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";

const W = 880;                                  // ความกว้างที่ใช้เรนเดอร์ตรวจ
const VBW = 440, VBH = 860;                     // ระบบพิกัดของฉากหน้า Home
const SAFE = { x0: 0, y0: 320, x1: 198, y1: 612 };   // โซนที่เห็นเสมอทุกจอ
const FORE = { x0: 0, y0: 612, x1: 198, y1: 756 };   // พื้นหน้าซ้าย ที่เห็นเสมอเหมือนกัน

/* ช่วง CSS ของธีมใน index.html + ชิ้นเอก/ชิ้นรางวัลของแต่ละฉาก
   ถ้าเพิ่มธีมใหม่ ให้เติมที่นี่ ไม่งั้นข้อ R8 จะถูกข้าม */
const SCENES = {
  "home-kintsugi": {
    css: ["/* ===== เตาเผารอยทอง (home-kintsugi) =====", "/* ===== ป่าแห่งผีเสื้อ"],
    hero: "#kgKiln", reward: "#kgVessel",
  },
  "home-clock": {
    css: ["/* ===== ห้องช่างนาฬิกา (home-clock) =====", "/* ===== เตาเผารอยทอง (home-kintsugi) ====="],
    hero: "#ckCase", reward: "#ckShelf",
  },
};

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const pct = n => (n * 100).toFixed(1) + "%";

function themeCSS(marks) {
  if (!marks) return "";
  const src = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const a = src.indexOf(marks[0]), b = src.indexOf(marks[1], a + 1);
  return (a < 0 || b < 0) ? "" : src.slice(a, b);
}

async function checkOne(file) {
  const svgPath = path.isAbsolute(file) ? file : path.join(__dirname, file);
  const id = path.basename(svgPath, ".svg");
  const cfg = SCENES[id] || {};
  const svg = fs.readFileSync(svgPath, "utf8");
  const R = [];
  const add = (code, name, pass, detail) => R.push({ code, name, pass, detail });

  /* ── ตรวจที่ตัวไฟล์ก่อน (ไม่ต้องเรนเดอร์) ─────────────────────────── */
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  add("R7a", "viewBox เป็น 440x860", !!vb && +vb[1] === VBW && +vb[2] === VBH, vb ? vb[1] + "x" + vb[2] : "ไม่มี viewBox");
  add("R7b", "ไม่มี <image>/ลิงก์ไฟล์ภายนอก", !/<image\b|xlink:href="http|href="http/.test(svg), "");
  // สีทุกตัวต้องผ่าน var(--x,#hex) ไม่ใช่ hex ลอย  (ยกเว้นใน <defs> ที่เป็น stop ของ gradient เฉพาะทาง)
  const bareHex = (svg.match(/(?:fill|stroke)="#[0-9A-Fa-f]{3,8}"/g) || []);
  add("R7c", "ทุกสีผ่าน CSS var", bareHex.length === 0, bareHex.length ? bareHex.length + " จุดใช้ hex ลอย เช่น " + bareHex[0] : "");

  /* ── เรนเดอร์แล้ววัดพิกเซล ────────────────────────────────────────── */
  const SC = W / VBW, HH = Math.round(VBH * SC);
  const css = themeCSS(cfg.css).replace(/\.hsAnim /g, "");
  const html = `<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:#000}
    #wrap{width:${W}px}#wrap svg{width:100%;height:auto;display:block}${css}</style><div id=wrap>${svg}</div>`;
  const tmp = path.join(require("os").tmpdir(), "_check-scene-" + id + ".html");
  fs.writeFileSync(tmp, html, "utf8");

  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
  const page = await b.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.setViewport({ width: W, height: HH });
  await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 600));

  const shot = await page.screenshot({ encoding: "base64" });
  const boxes = cfg.hero ? await page.evaluate((h, rw) => {
    const g = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    return { hero: g(h), reward: g(rw) };
  }, cfg.hero, cfg.reward) : { hero: null, reward: null };

  const m = await page.evaluate(async (b64, SC, SAFE, FORE) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const L = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const Wp = c.width, Hp = c.height;

    const all = [];
    for (let i = 0; i < d.length; i += 4) all.push(L(i));
    const sorted = all.slice().sort((a, b) => a - b);
    const q = p => sorted[Math.floor(p * (sorted.length - 1))];

    // ค่าเฉลี่ยของแถบแนวนอน 6 แถบ
    const bands = [];
    for (let k = 0; k < 6; k++) {
      const y0 = Math.floor(Hp * k / 6), y1 = Math.floor(Hp * (k + 1) / 6);
      let s = 0, n = 0;
      for (let y = y0; y < y1; y += 2) for (let x = 0; x < Wp; x += 2) { s += L((y * Wp + x) * 4); n++; }
      bands.push(s / n);
    }

    // ความหนาแน่นของรายละเอียด = ส่วนเบี่ยงเบนมาตรฐานในเซลล์ย่อย
    function cellStats(rx0, ry0, rx1, ry1, cols, rows) {
      const out = [];
      const px0 = rx0 * SC, py0 = ry0 * SC, px1 = rx1 * SC, py1 = ry1 * SC;
      for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
        const x0 = Math.floor(px0 + (px1 - px0) * cc / cols), x1 = Math.floor(px0 + (px1 - px0) * (cc + 1) / cols);
        const y0 = Math.floor(py0 + (py1 - py0) * r / rows), y1 = Math.floor(py0 + (py1 - py0) * (r + 1) / rows);
        let s = 0, s2 = 0, n = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const v = L((y * Wp + x) * 4); s += v; s2 += v * v; n++; }
        const mean = s / n;
        out.push({ r, c: cc, sd: Math.sqrt(Math.max(0, s2 / n - mean * mean)), mean });
      }
      return out;
    }

    const safeCells = cellStats(SAFE.x0, SAFE.y0, SAFE.x1, SAFE.y1, 6, 9);
    const foreCells = cellStats(FORE.x0, FORE.y0, FORE.x1, FORE.y1, 6, 5);
    const leftCells = cellStats(0, 320, 198, 612, 6, 9);
    const rightCells = cellStats(226, 320, 440, 612, 6, 9);

    // แผ่นสว่างแบน: กลุ่มพิกเซลสว่างที่ไม่มีการไล่ค่าเลย = ของขาวถูกวาดแบน
    const bright = all.filter(v => v > 170).length / all.length;
    // เก็บ sd ของกริดหยาบเฉพาะเซลล์ที่สว่างจัด
    const coarse = cellStats(0, 0, 440, 860, 11, 21);
    const flatBright = coarse.filter(k => k.mean > 165 && k.sd < 9).length / coarse.length;

    return {
      median: q(.5), p99: q(.99), p999: q(.999),
      brightShare: bright,
      bands,
      safeDead: safeCells.filter(k => k.sd < 3.2).length / safeCells.length,
      foreDead: foreCells.filter(k => k.sd < 3.2).length / foreCells.length,
      leftSd: leftCells.reduce((a, k) => a + k.sd, 0) / leftCells.length,
      rightSd: rightCells.reduce((a, k) => a + k.sd, 0) / rightCells.length,
      flatBright,
    };
  }, shot, SC, SAFE, FORE);
  await b.close();

  const bandSpread = Math.sqrt(m.bands.reduce((a, v) => a + (v - m.bands.reduce((x, y) => x + y, 0) / 6) ** 2, 0) / 6);

  add("R1", "ห้องมีแถบค่าไม่แบน (sd ของ 6 แถบ >= 5)", bandSpread >= 5, "sd=" + bandSpread.toFixed(1));
  add("R2a", "มีจุดสว่างที่ชนะทั้งจออย่างชัดเจน (p99.9 >= 2.2x median)", m.p999 >= m.median * 2.2, `p99.9=${m.p999.toFixed(0)} median=${m.median.toFixed(0)}`);
  add("R2b", "จุดสว่างต้องเล็ก (พิกเซล lum>170 ไม่เกิน 8% ของจอ)", m.brightShare <= 0.08, pct(m.brightShare));
  add("R3", "โซนที่เห็นเสมอไม่มีช่องว่างตายเกิน 22%", m.safeDead <= 0.22, pct(m.safeDead));
  add("R4", "พื้นหน้าซ้ายไม่ถูกทิ้งว่างเกิน 55%", m.foreDead <= 0.55, pct(m.foreDead));
  add("R5", "ฝั่งขวาต้องเงียบกว่าฝั่งซ้าย (sd ขวา <= 0.85x ซ้าย)", m.rightSd <= m.leftSd * 0.85, `ซ้าย=${m.leftSd.toFixed(1)} ขวา=${m.rightSd.toFixed(1)}`);
  add("R6", "ไม่มีแผ่นสว่างแบนไร้การไล่ค่า (<= 1.2% ของเซลล์)", m.flatBright <= 0.012, pct(m.flatBright));
  add("R7d", "เรนเดอร์แล้วไม่มี error", errs.length === 0, errs[0] || "");

  if (boxes.hero && boxes.reward) {
    const h = boxes.hero, rw = boxes.reward;
    const hcx = h.x + h.w / 2, hcy = h.y + h.h / 2;
    add("R8a", "มวลเอกอยู่กลางโซนปลอดภัย", hcx >= SAFE.x0 && hcx <= SAFE.x1 && hcy >= SAFE.y0 - 60 && hcy <= SAFE.y1 + 60,
      `ศูนย์กลาง ${hcx.toFixed(0)},${hcy.toFixed(0)}`);
    const ratio = (h.w * h.h) / (rw.w * rw.h);
    add("R8b", "มวลเอกต้องใหญ่กว่าชิ้นรางวัลอย่างน้อย 1.8 เท่า", ratio >= 1.8, "อัตราส่วน " + ratio.toFixed(2));
    /* ห้ามยืนเทียบไหล่ = อาการที่ทำให้ฉากรอบก่อน "อึดอัด"
       สองก้อนกินแถบแนวตั้งเดียวกันเกือบทั้งก้อน + ขนาดพอกัน -> ตาอ่านเป็นของสองชิ้นแย่งกันเป็นพระเอก
       ต้องแก้ด้วยการย้ายความลึก (ก้อนหนึ่งไปพื้นหน้า) ไม่ใช่แค่ขยับซ้ายขวา */
    const ovY = Math.max(0, Math.min(h.y + h.h, rw.y + rw.h) - Math.max(h.y, rw.y)) / Math.min(h.h, rw.h);
    add("R8c", "ชิ้นรางวัลต้องคนละความลึกกับมวลเอก (ไม่ยืนเทียบไหล่)", !(ovY > 0.6 && ratio < 3),
      `ซ้อนแนวตั้ง ${pct(ovY)} อัตราส่วนขนาด ${ratio.toFixed(2)}`);
  } else if (cfg.hero) {
    add("R8", "หา selector ของมวลเอก/ชิ้นรางวัลไม่เจอ", false, cfg.hero + " / " + cfg.reward);
  } else {
    R.push({ code: "R8", name: "ข้าม — ฉากนี้ยังไม่ประกาศ id ของมวลเอก/ชิ้นรางวัล", skip: true, detail: "" });
  }

  return { id, R };
}

(async () => {
  const arg = process.argv[2] || "home-kintsugi.svg";
  const files = arg === "--all" ? Object.keys(SCENES).map(k => k + ".svg") : [arg];
  let failed = 0;
  for (const f of files) {
    const { id, R } = await checkOne(f);
    console.log("\n=== " + id + " ===");
    R.forEach(r => {
      if (r.skip) { console.log(`  --   ${r.code.padEnd(5)} ${r.name}`); return; }
      if (!r.pass) failed++;
      console.log(`  ${r.pass ? "ok  " : "FAIL"} ${r.code.padEnd(5)} ${r.name}${r.detail ? "   [" + r.detail + "]" : ""}`);
    });
  }
  console.log(failed ? `\nไม่ผ่าน ${failed} ข้อ — ยังส่งงานไม่ได้` : "\nผ่านครบทุกข้อ");
  process.exit(failed ? 1 : 0);
})();
