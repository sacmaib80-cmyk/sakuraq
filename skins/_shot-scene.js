/* เรนเดอร์ไฟล์สกินฉากเดี่ยว ๆ + ครอปซูมทีละชิ้น + probe สีพิกเซล + เช็คว่าอนิเมชั่นขยับจริง
   รัน:  node skins/_shot-scene.js [ชื่อไฟล์.svg] [แท็ก]
   ภาพออกที่ screens/skin-audit/ และถูก gitignore ไว้
   ⚠ ห้ามเขียนภาพลงใน www/ เด็ดขาด: cap sync ก๊อป www/ ทั้งโฟลเดอร์เข้า APK
     .gitignore กัน git ได้ แต่กัน cap sync ไม่ได้ -> ภาพ debug จะติดไปกับ APK ที่แจกจริง
     (เจอจริงตอน build v0.18.19: ภาพ 1.1 MB หลุดเข้า APK)

   ทำไมต้องมีตัวนี้ (บทเรียนใน _ART-PROCESS ข้อ 30/31):
     - screenshot ในแอปแยก "ไม่ได้วาด" ออกจาก "โดนบัง" ไม่ได้ ต้องเรนเดอร์ไฟล์เดี่ยวคู่กันเสมอ
     - ฉากมืดดูด้วยตาอย่างเดียวเชื่อไม่ได้ ต้องวัด lum เทียบกับของที่รู้ว่าถูก
   ต้องติดตั้ง puppeteer-core ด้วย npm install */
const fs = require("fs"), path = require("path");
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME_PATH || "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const OUT = path.join(__dirname, "..", "screens", "skin-audit");
const FILE = process.argv[2] || "home-clock.svg";
const SVGP = path.isAbsolute(FILE) ? FILE : path.join(__dirname, FILE);
const TAG = process.argv[3] || path.basename(SVGP, ".svg");
const WIDE = 880;

/* CSS อนิเมชั่นของธีมอยู่ใน index.html (แหล่งเดียว) — ดึงมาฉีดตอนเรนเดอร์ จะได้ไม่มี 2 ก๊อป */
function themeCSS(startMark, endMark) {
  const src = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const a = src.indexOf(startMark), b = src.indexOf(endMark, a + 1);
  return (a < 0 || b < 0) ? "" : src.slice(a, b);
}
/* กรอบซูมของแต่ละธีม: [ชื่อ, x, y, w, h] เป็นพิกัด viewBox */
const CROPS = {
  "home-clock": [
    ["dial", 14, 275, 180, 175], ["train", 14, 280, 180, 155], ["trunk", 8, 425, 190, 165],
    ["pediment", 0, 200, 200, 100], ["plinth-floor", 0, 550, 230, 140],
    ["walldials", 220, 145, 220, 245], ["floor", 0, 600, 440, 180],
  ],
  "home-kintsugi": [
    ["mouth", 30, 380, 190, 230], ["vessel", 0, 540, 130, 230],
    ["bowl", 100, 660, 130, 100], ["woodpile", 226, 490, 206, 135],
    ["shelf", 226, 320, 214, 80], ["flue", 60, 0, 140, 300],
  ],
};
/* ช่วง CSS ของธีมใน index.html (หัว-ท้าย) */
const MARKS = {
  "home-clock": ["/* ===== ห้องช่างนาฬิกา (home-clock) =====", "/* ===== เตาเผารอยทอง (home-kintsugi) ====="],
  "home-kintsugi": ["/* ===== เตาเผารอยทอง (home-kintsugi) =====", "/* ===== ป่าแห่งผีเสื้อ"],
};
const PROBES = {
  "home-clock": [
    ["ผนังมุมขวาบน", 410, 40], ["ผนังข้างนาฬิกา", 215, 350],
    ["วงหน้าปัด (ต้องสว่างสุดในห้อง)", 80, 314], ["ล้อทองเหลืองในห้องเครื่อง", 33, 298],
    ["ลูกตุ้มทองเหลือง", 99, 526], ["พื้นใกล้นาฬิกา", 150, 660],
    ["พื้นมุมขวา", 410, 700], ["ไม้ฝาผนังล่าง", 300, 520],
  ],
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const svg = fs.readFileSync(SVGP, "utf8");
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const VW = +vb[1], VH = +vb[2], SC = WIDE / VW;
  const css = (MARKS[TAG] ? themeCSS(MARKS[TAG][0], MARKS[TAG][1]) : "");
  const html = "<!doctype html><html><head><meta charset=utf-8><style>" +
    "html,body{margin:0;background:#000}#wrap{width:" + WIDE + "px}#wrap svg{width:100%;height:auto;display:block}" +
    css.replace(/\.hsAnim /g, "") + "</style></head><body><div id=wrap>" + svg + "</div></body></html>";
  const tmp = path.join(OUT, "_preview.html");
  fs.writeFileSync(tmp, html, "utf8");

  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
  const page = await b.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  /* headless ตั้ง reduce มาแต่แรก ถ้าไม่ปิดจะวัดอนิเมชั่นผิดหมด */
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.setViewport({ width: WIDE, height: Math.round(VH * SC) });
  await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({ path: path.join(OUT, TAG + "-full.png") });
  for (const [n, x, y, w, h] of (CROPS[TAG] || [])) {
    await page.screenshot({
      path: path.join(OUT, TAG + "-" + n + ".png"),
      clip: { x: Math.round(x * SC), y: Math.round(y * SC), width: Math.round(w * SC), height: Math.round(h * SC) }
    });
  }
  const shot = await page.screenshot({ encoding: "base64" });
  const probes = await page.evaluate(async (b64, PR, SC) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    return PR.map(([n, x, y]) => {
      const d = g.getImageData(Math.round(x * SC), Math.round(y * SC), 1, 1).data;
      return { n, rgb: [d[0], d[1], d[2]], lum: Math.round(0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]) };
    });
  }, shot, PROBES[TAG] || [], SC);

  const box = sel => page.evaluate(s => {
    const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); return Math.round(r.left + r.width / 2);
  }, sel);
  const p1 = await box(".ckPend"); await new Promise(r => setTimeout(r, 520)); const p2 = await box(".ckPend");

  console.log("ภาพ: " + TAG + "-full.png + ครอป " + (CROPS[TAG] || []).length + " ใบ ที่ " + OUT);
  if (probes.length) {
    console.log("--- ความสว่างพิกเซล (lum 0-255) ---");
    probes.forEach(p => console.log("  " + p.n.padEnd(30) + " rgb(" + p.rgb.join(",") + ")  lum " + p.lum));
  }
  if (p1 !== null) console.log("ลูกตุ้ม: " + p1 + " -> " + p2 + (p1 !== p2 ? "  แกว่งจริง" : "  ไม่ขยับ !!"));
  console.log(errs.length ? "PAGEERROR:\n" + errs.join("\n") : "0 pageerror");
  await b.close();
})();
