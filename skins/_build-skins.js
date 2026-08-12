/**
 * ยัดงานวาด SVG จาก www/skins/*.svg เข้า www/index.html เป็นก้อน SKIN_SVG
 * แก้ "งานวาด" ที่ไฟล์ SVG แล้วรันสคริปต์นี้ใหม่ — ห้ามแก้ในตัว index.html
 *
 * รัน:  node www/skins/_build-skins.js [--dry]        (จาก d:/git)
 *
 * (อยู่ในเรโปข้าง ๆ งานวาดเลย เพราะตอนอยู่ใน scratchpad มันหายทุกครั้งที่ขึ้น session ใหม่)
 */
const fs = require("fs");
const path = require("path");

const DIR  = __dirname;                                   // www/skins
const FILE = path.join(DIR, "..", "index.html");          // www/index.html
const DRY  = process.argv.includes("--dry");

/* ลำดับในนี้ = ลำดับใน SKIN_SVG (ไม่มีผลกับการทำงาน แค่ให้อ่านง่าย) */
const IDS = [
  "btn-pixel", "btn-bolt", "btn-gilded", "btn-hull", "btn-saucer", "btn-royal", "btn-court",
  "dice-pearl", "dice-ufo", "dice-royal",
  "home-attic", "home-library", "home-sakura", "home-abyss", "home-alien", "home-academy", "home-court",
  "timer-abyss", "timer-abyss-jelly",   // "timer-rose" = ตัวที่พักไว้ ใส่กลับได้เลยถ้าจะทำต่อ
  "timer-beam", "timer-beam-crystal",
  "fx-bubble", "fx-warp", "fx-crest",
];

/* ═══ ชุด "ป่าแห่งผีเสื้อเวทมนต์" — ซ่อนไว้ ยังไม่ปล่อยให้ใครเห็น (2026-08-12) ═══
   งานอาร์ตฉากหลังยังไม่ผ่าน user เลยพักไว้ทั้งชุด งานวาดย้ายออกไปนอก www แล้ว
   (อยู่ที่ d:\git\skins-wip\ — ไม่ได้อยู่ใน www จึงไม่ถูกแจกไปกับเว็บ/APK)

   วิธีเอากลับมาทำต่อ ทำ 3 อย่างนี้:
     1. ย้ายไฟล์กลับ:  mv skins-wip/*.svg www/skins/
     2. เติม 5 id นี้กลับเข้า IDS ข้างบน:
          "btn-butterfly" · "dice-wish" · "home-butterfly" · "butterfly-flyby" · "fx-wish"
     3. ปลดคอมเมนต์ของ 5 ชิ้นใน STORE_ITEMS ของ www/index.html (ค้นคำว่า "ป่าแห่งผีเสื้อเวทมนต์")
   CSS / ตัวคุมผีเสื้อบินผ่านจอ / i18n ยังอยู่ครบใน index.html ไม่ต้องทำอะไรเพิ่ม */

/* งานวาดที่อยู่นอก www/skins/ — ชุดมาสคอตอยู่ข้าง fox.svg เพราะพิกัดผูกกับตัวหมา
   (ถ้าก๊อปมาไว้ที่นี่ด้วยจะมี 2 ก๊อป แล้วแก้ไม่ตรงกันแน่นอน) */
const EXTRA = {
  "mascot-space":  path.join(DIR, "..", "..", "mascot-svg", "space-suit.svg"),
  "mascot-shades": path.join(DIR, "..", "..", "mascot-svg", "deal-shades.svg"),
  "mascot-academy":path.join(DIR, "..", "..", "mascot-svg", "academy-uniform.svg"),
  "mascot-basket": path.join(DIR, "..", "..", "mascot-svg", "basket-jersey.svg"),
  "mascot-cozy":   path.join(DIR, "..", "..", "mascot-svg", "cozy-knit.svg"),
};

const START = "/* ===== SKIN ART — สร้างจาก www/skins/*.svg โดย scratchpad/build-skins.js ===== */";
const END   = "/* ===== END SKIN ART ===== */";

const clean = (svg) => svg
  .replace(/<!--[\s\S]*?-->/g, "")        // คอมเมนต์อธิบายงานวาด เก็บไว้ในไฟล์ต้นทางพอ
  .replace(/\n\s*\n/g, "\n")
  .replace(/^\s+/gm, "")
  .trim();

const srcPath = (id) => EXTRA[id] || path.join(DIR, id + ".svg");
const ALL = IDS.concat(Object.keys(EXTRA));

const parts = ALL.map(id => {
  const svg = clean(fs.readFileSync(srcPath(id), "utf8"));
  if (/[`]|\$\{/.test(svg)) throw new Error("SVG มี backtick หรือ ${ ทำให้ template literal พัง: " + id);
  return `  "${id}": ${JSON.stringify(svg)},`;
}).join("\n");

const block = `${START}\n/* งานวาดมือทั้งหมด — แก้ที่ www/skins/<id>.svg แล้วรัน node www/skins/_build-skins.js ใหม่ */\nconst SKIN_SVG = {\n${parts}\n};\n${END}`;

let src = fs.readFileSync(FILE, "utf8");
if (src.includes(START)) {
  const a = src.indexOf(START);
  const b = src.indexOf(END) + END.length;
  src = src.slice(0, a) + block + src.slice(b);
  console.log("แทนที่ก้อนเดิม");
} else {
  const anchor = "const STORE_ITEMS = [";
  const i = src.indexOf(anchor);
  if (i < 0) throw new Error("หา STORE_ITEMS ไม่เจอ");
  src = src.slice(0, i) + block + "\n\n" + src.slice(i);
  console.log("แทรกก้อนใหม่ก่อน STORE_ITEMS");
}

const total = ALL.reduce((n, id) => n + fs.statSync(srcPath(id)).size, 0);
console.log("รวมงานวาด " + ALL.length + " ชิ้น · ต้นฉบับ " + (total / 1024).toFixed(1) + " KB · หลังตัดคอมเมนต์ " + (block.length / 1024).toFixed(1) + " KB");
if (DRY) { console.log("--dry: ไม่เขียน"); process.exit(0); }
fs.writeFileSync(FILE, src, "utf8");
console.log("✅ เขียน index.html แล้ว");
