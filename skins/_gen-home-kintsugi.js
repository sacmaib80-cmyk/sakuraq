/* สร้าง home-kintsugi.svg — ฉากหน้า Home ของ SakuraQ
   ไฟล์นี้คือแหล่งความจริง แก้ตัวเลขที่นี่แล้วรันใหม่ ห้ามแก้ .svg ด้วยมือ
     node www/skins/_gen-home-kintsugi.js && node www/skins/_build-skins.js

   ── สัญญาพิกัด (วัดจากแอปจริง ดู _ART-PROCESS ข้อ 35) ──────────────────
   viewBox 440x860 · เส้นพื้น y=612
   การ์ดคะแนน+ปุ่ม CTA กินถึง y=320  ·  มาสคอตกิน x 200-435 ที่ y 385-690
   ปุ่มลูกเต๋าลอย x 337-415 y 677-768  ·  แถบเมนูล่าง y 762 ลงไป
   -> โซนที่เห็นเสมอ = x 0-198 ที่ y 320-612  บวกแถบ y 320-385 เต็มความกว้าง
      บวก x 0-198 ที่ y 612-756 (พื้นหน้าซ้าย ซึ่งเดิมปล่อยว่างทิ้งไปเปล่าๆ)

   ── กฎองค์ประกอบของฉากนี้ (ที่มาของรอบแก้ 2026-08-20) ────────────────
   รอบก่อนแน่นจนอึดอัดเพราะ "มวลใหญ่สองก้อนขนาดพอกันยืนชนกัน" (เตา+แจกัน)
   แล้วพื้นล่าง 1 ใน 3 ของจอถูกทิ้งว่างเป็นกระดาษกราฟ  รอบนี้จึงบังคับ:
     1. มวลเอกมีก้อนเดียว = เตา  กินความกว้าง 46-204 ปากเตาอยู่กลางโซนปลอดภัย
     2. แจกันที่ซ่อมแล้ว = "รางวัล" ย้ายลงพื้นหน้า (foreground) ตัวเล็กกว่าเตาชัดเจน
        และอยู่คนละความลึก -> ทับกันได้ ไม่ใช่ยืนเทียบไหล่กัน
     3. ปล่องไฟทะลุออกนอกเฟรมด้านบน  เงาตัดจึงเปิดโล่ง ไม่เป็นทรงขวด/จรวด
     4. ฝั่งขวาต้อง "เงียบ" กว่าฝั่งซ้ายเสมอ: ชั้นเดียว + กองฟืน ไม่ใช่ของแขวนเต็มผนัง
     5. กลางคืน = ของขาวห้ามเป็นสีขาวแบน ต้องมีด้านสว่าง/ด้านเงาจากไฟเตา
     ตรวจข้อพวกนี้อัตโนมัติได้ที่ node www/skins/_check-scene.js home-kintsugi.svg

   ── กลไก ──────────────────────────────────────────────────────────────
   เตาให้ความร้อน แต่ "ภารกิจที่ทำจริงวันนี้" เป็นสิ่งเติมทอง
   1 ภารกิจ = รอยซ่อมบนแจกัน 1 แขนง + ลายฝังทองบนไหล่เตา 1 ดวง (สูงสุด 5)
   JS แตะเฉพาะ class is-lit บน [data-kg-step] และ [data-kg-complete]
   #kgVessel ต้องมีอยู่เสมอ (updateGildedKilnState ใช้เป็นตัวเช็คว่าธีมนี้ถูกใส่อยู่) */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "home-kintsugi.svg");
const W = 440;
const H = 860;
const FLOOR_Y = 612;
const KX = 125;            // แกนกลางเตา = กลางโซนปลอดภัย x 0-198
const n2 = n => Math.round(n * 100) / 100;

const C = {
  wall0: "var(--kg-wall-0,#050C13)",
  wall1: "var(--kg-wall-1,#0C1E29)",
  wall2: "var(--kg-wall-2,#14313B)",
  plaster: "var(--kg-plaster,#22414A)",
  ink: "var(--kg-ink,#040B10)",
  shadow: "var(--kg-shadow,#02060A)",
  floor0: "var(--kg-floor-0,#0A141A)",
  floor1: "var(--kg-floor-1,#15262E)",
  floor2: "var(--kg-floor-2,#22383F)",
  timber0: "var(--kg-timber-0,#1C0F0D)",
  timber1: "var(--kg-timber-1,#42241B)",
  timber2: "var(--kg-timber-2,#77462F)",
  clay0: "var(--kg-clay-0,#2E120E)",
  clay1: "var(--kg-clay-1,#5B2417)",
  clay2: "var(--kg-clay-2,#8E3D22)",
  clay3: "var(--kg-clay-3,#C4653A)",
  iron0: "var(--kg-iron-0,#0D1417)",
  iron1: "var(--kg-iron-1,#232D31)",
  iron2: "var(--kg-iron-2,#4E5B61)",
  cobalt0: "var(--kg-cobalt-0,#071A2D)",
  cobalt1: "var(--kg-cobalt-1,#123656)",
  cobalt2: "var(--kg-cobalt-2,#2F6688)",
  cobalt3: "var(--kg-cobalt-3,#6FA8C4)",
  porcelain0: "var(--kg-porcelain-0,#9FA79F)",
  porcelain1: "var(--kg-porcelain-1,#D8D6C6)",
  porcelain2: "var(--kg-porcelain-2,#FFF6DD)",
  gold0: "var(--kg-gold-0,#5E3D14)",
  gold1: "var(--kg-gold-1,#C08327)",
  gold2: "var(--kg-gold-2,#FFE39A)",
  fire0: "var(--kg-fire-0,#7E1D18)",
  fire1: "var(--kg-fire-1,#EC4B25)",
  fire2: "var(--kg-fire-2,#FFB339)",
  fire3: "var(--kg-fire-3,#FFF0A6)",
  moon: "var(--kg-moon,#B9E7F5)",
};

const F = (fill, extra = "") => ` fill="${fill}"${extra}`;
const S = (stroke, width, extra = "") => ` fill="none" stroke="${stroke}" stroke-width="${n2(width)}"${extra}`;
const circle = (cx, cy, r, fill, extra = "") => `<circle${F(fill, extra)} cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}"/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = "") => `<ellipse${F(fill, extra)} cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(rx)}" ry="${n2(ry)}"/>`;
const rect = (x, y, w, h, fill, extra = "") => `<rect${F(fill, extra)} x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"/>`;

/* ── รูปทรงหลักที่ต้องใช้ซ้ำ (ทั้งวาดและทำ clipPath) ─────────────────── */

// เตา: โดมดินหนา ไหล่ผายออก คอสั้น — ตั้งใจให้ "อ้วนเตี้ย" ไม่ใช่ทรงขวด
const kilnBodyPath = [
  "M 38 642",
  "L 38 474",
  "C 38 404 56 366 88 344",
  "L 88 336",
  "H 162",
  "L 162 344",
  "C 194 366 212 404 212 474",
  "L 212 642",
  "Z",
].join(" ");

// ปากเตา: ช่องดำที่ไฟอยู่ข้างใน (กลาง x=125 = กลางโซนปลอดภัย)
const fireOpeningPath = [
  "M 83 582",
  "L 83 500",
  "C 83 458 102 438 125 438",
  "C 148 438 167 458 167 500",
  "L 167 582",
  "Z",
].join(" ");

// แจกัน (พิกัดในระบบของตัวเอง ถูกย่อ+ย้ายด้วย transform ตอนวาง)
const vesselPath = [
  "M 48 342",
  "C 48 355 47 366 41 376",
  "C 34 388 21 397 17 418",
  "C 11 450 15 500 26 527",
  "C 31 540 37 548 44 552",
  "L 40 560",
  "C 54 565 82 565 96 560",
  "L 92 552",
  "C 101 546 108 536 112 520",
  "C 120 488 120 445 113 418",
  "C 108 398 94 389 87 376",
  "C 81 366 80 355 80 342",
  "Z",
].join(" ");

// แจกันอยู่พื้นหน้า: ย่อ 0.88 แล้ววางให้ก้นอยู่ที่ (55,750) ยอดอยู่ y~556
const VS = 0.88;
const VTX = n2(55 - 68 * VS);
const VTY = n2(750 - 563 * VS);
const vw = (w) => n2(w / VS);   // ชดเชยความหนาเส้นให้เท่าเดิมหลังย่อ

/* ── ผนัง: ไล่ค่าเป็นแถบ ไม่ใช่สีเดียวทั้งผืน ────────────────────────── */
function wall() {
  let s = `<g id="kgWall">`;
  s += rect(0, 0, W, FLOOR_Y, "url(#kgWallG)");

  // เกรนปูน: จุดกลมเล็กโปรย ไม่ใช่วงรีจาง (ข้อ 37 — วงรีจางถูกอ่านเป็นจานบิน)
  let seed = 37;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 190; i++) {
    s += circle(rnd() * W, rnd() * 600, 0.45 + rnd() * 1.3, C.porcelain2,
      ` opacity="${(0.03 + rnd() * 0.075).toFixed(3)}"`);
  }

  // คราบเขม่าเหนือเตา = เหตุผลทางกายภาพที่ทำให้ค่าผนังไม่เท่ากันทั้งผืน
  s += `<ellipse fill="url(#kgSoot)" cx="${KX}" cy="250" rx="150" ry="270"/>`;

  // รอยต่อปูน 2 เส้นแบ่งผนังเป็นแถบ (บน/กลาง/ล่าง)
  s += `<path${S(C.plaster, 1.1, ' opacity=".22"')} d="M0 300 C104 286 190 300 262 288 C330 277 384 288 440 276"/>`;
  s += `<path${S(C.ink, 1.4, ' opacity=".3"')} d="M0 452 C110 442 196 456 268 446 C336 437 386 448 440 440"/>`;
  s += `<path${F(C.wall1, ' opacity=".55"')} d="M0 452 C110 442 196 456 268 446 C336 437 386 448 440 440 V612 H0 Z"/>`;

  // คานเพดาน + เสาแบ่งเขต: ให้ของบนผนังมีเหตุผลเชิงโครงสร้างที่จะอยู่ตรงนั้น
  s += rect(0, 268, W, 16, C.timber0);
  s += rect(0, 268, W, 3.2, C.timber2, ' opacity=".62"');
  s += rect(0, 281, W, 3, C.shadow, ' opacity=".5"');
  s += rect(216, 284, 13, 328, C.timber0);
  s += rect(219, 284, 3, 328, C.timber2, ' opacity=".34"');
  s += rect(424, 284, 16, 328, C.timber0);
  s += rect(424, 284, 3, 328, C.timber2, ' opacity=".4"');

  // รอยแตกปูนเกาะกับคาน ไม่ลอยเดี่ยว
  s += `<g${S(C.ink, 1, ' opacity=".26" stroke-linecap="round"')}>`;
  s += `<path d="M232 300 l-13 12 4 14-9 11"/>`;
  s += `<path d="M414 340 l-11 9 4 11-9 8"/>`;
  s += `</g></g>`;
  return s;
}

/* ── แสง: ชั้น blur ที่ไม่ขยับเลย (ข้อ 34) ───────────────────────────── */
function lightPools() {
  return `<g id="kgLightPools" filter="url(#kgSoft)">
    <ellipse fill="url(#kgMoonPool)" cx="332" cy="176" rx="150" ry="140"/>
    <ellipse class="kgKilnGlow" fill="url(#kgFirePool)" cx="${KX}" cy="500" rx="196" ry="200" opacity=".9"/>
    <ellipse fill="url(#kgFirePool)" opacity=".62" cx="${KX}" cy="676" rx="215" ry="112"/>
  </g>`;
}

/* ── หน้าต่าง: ตารางตรงล้วน ไม่มีเส้นทแยง (ทแยงถูกอ่านเป็นตาข่าย/กรง) ── */
function windowPanel() {
  let s = `<g id="kgWindow">`;
  s += rect(248, 100, 160, 150, C.timber0);
  s += rect(255, 107, 146, 136, "url(#kgWindowG)");
  s += `<g clip-path="url(#kgWinClip)">`;
  s += circle(352, 158, 25, C.moon, ' opacity=".92"');
  s += circle(341, 149, 24, "url(#kgWindowG)");
  s += circle(300, 128, 1.5, C.moon, ' opacity=".6"');
  s += circle(378, 210, 1.2, C.moon, ' opacity=".45"');
  s += circle(272, 196, 1.1, C.moon, ' opacity=".4"');
  s += `<path class="kgWindowShine"${F(C.moon, ' opacity=".08"')} d="M258 110 H278 L340 240 H316 Z"/>`;
  s += `</g>`;
  s += `<g${S(C.timber1, 4.4, ' stroke-linecap="square"')}>`;
  [304, 352].forEach(x => s += `<path d="M${x} 107 V243"/>`);
  [152, 198].forEach(y => s += `<path d="M255 ${y} H401"/>`);
  s += `</g>`;
  s += rect(248, 100, 160, 5, C.timber2, ' opacity=".55"');
  s += rect(244, 246, 168, 9, C.timber0);
  s += rect(244, 246, 168, 2.4, C.timber2, ' opacity=".6"');
  s += `</g>`;
  return s;
}

/* ── ถ้วยชาม: ใช้ตัวเดียวกันทุกใบ เปลี่ยนแค่ scale/สี (ข้อ 25) ────────── */
function pottery(x, y, sc, type, accent) {
  let s = `<g transform="translate(${x} ${y}) scale(${sc})">`;
  s += ellipse(0, 2, 18, 4, C.shadow, ' opacity=".5"');
  if (type === 0) {
    s += `<path${F(C.porcelain1)} d="M-13-29 C-13-18-20-13-19 0 C-18 14-10 22 0 23 C10 22 18 14 19 0 C20-13 13-18 13-29 Z"/>`;
    s += `<path${F(C.ink, ' opacity=".46"')} d="M-13-29 C-13-18-20-13-19 0 C-18 14-10 22 0 23 C-6 12-7-8-4-29 Z"/>`;
    s += `<path${F(accent)} d="M-19 1 C-8-4 8 4 19-2 V8 C7 13-8 7-18 12 Z"/>`;
    s += `<path${S(C.cobalt3, 1.6, ' opacity=".7"')} d="M-16 5 C-7 1 8 8 17 3"/>`;
    s += rect(-12, -33, 24, 5, C.gold0);
    s += `<path${S(C.fire2, 1.6, ' opacity=".4"')} d="M15-26 C20-13 19 4 12 18"/>`;
  } else if (type === 1) {
    s += `<path${F(accent)} d="M-20-10 C-16 12 16 12 20-10 Z"/>`;
    s += `<path${F(C.porcelain2)} d="M-22-12 C-15-5 15-5 22-12 C15-19-15-19-22-12 Z"/>`;
    s += `<path${F(C.ink, ' opacity=".4"')} d="M-22-12 C-18 6-6 12 0 12 C-8 6-14-2-14-13 Z"/>`;
    s += `<path${S(C.gold1, 1.4)} d="M-19-12 C-12-8 12-8 19-12"/>`;
    s += `<path${S(C.fire2, 1.5, ' opacity=".42"')} d="M17-9 C15 4 8 10 2 12"/>`;
  } else {
    s += `<path${F(C.porcelain1)} d="M-17-18 C-23-6-17 16 0 18 C17 16 23-6 17-18 Z"/>`;
    s += `<path${F(C.ink, ' opacity=".44"')} d="M-17-18 C-23-6-17 16 0 18 C-8 10-11-6-8-18 Z"/>`;
    s += `<path${F(accent)} d="M-18-8 C-7-13 7-3 18-9 V2 C7 8-7-2-18 4 Z"/>`;
    s += `<path${S(C.gold0, 1.4)} d="M-14-19 H14"/>`;
    s += `<path${S(C.fire2, 1.5, ' opacity=".4"')} d="M15-15 C19-3 16 10 8 16"/>`;
  }
  s += `</g>`;
  return s;
}

/* ── ฝั่งขวา = โซนเงียบ: ชั้นเดียวในแถบที่เห็นเสมอ + กองฟืน ────────────
   เดิมฝั่งนี้มีชั้น 3 ชั้น + ราวแขวนเครื่องมือ 6 ชิ้น + ตู้จาน = แน่นเท่าฝั่งซ้าย
   ทั้งที่ 80% ของมันอยู่หลังมาสคอต -> เหลือของที่ "อยู่ในแถบ y 320-385" พอ */
function rightWall() {
  let s = `<g id="kgRight">`;

  // ชั้นเดียว วางในแถบที่มองเห็นเสมอ (y 320-385)
  s += rect(229, 378, 195, 10, C.timber0);
  s += rect(229, 378, 195, 2.4, C.timber2, ' opacity=".7"');
  s += `<path${F(C.timber0)} d="M250 388 h10 l-4 15 h-3 Z M398 388 h10 l-4 15 h-3 Z"/>`;
  s += ellipse(326, 381, 96, 5, C.shadow, ' opacity=".3"');
  // ขนาดต่างกันชัด: ใหญ่ / กลาง / เล็ก  (ขนาดเท่ากันหมด = ไม่มีลำดับสายตา)
  s += pottery(262, 378, .9, 0, C.cobalt0);
  s += pottery(320, 377, .62, 2, C.clay2);
  s += pottery(368, 378, .74, 1, C.cobalt1);
  s += pottery(407, 378, .46, 2, C.clay3);

  /* กองฟืน = คำตอบว่าไฟมาจากไหน + ถมผนังล่างขวาที่เคยว่าง
     🔴 หน้าตัดท่อนไม้ (วงกลม) พังสองรอบติด: รอบแรกอ่านเป็น "โดนัท" รอบสองอ่านเป็น "ฟองอากาศ"
        เพราะที่รัศมี ~10 หน่วยบนพื้นน้ำเงิน วงกลมทึบสีเข้ม = รู ไม่ใช่ไม้
        ตามกฎข้อ 24 จึง "เปลี่ยนของ" ไม่วาดรอบสาม -> มองกองฟืนจากด้านข้างแทน
        ท่อนยาวแนวนอนปลายมน = เงาที่ไม่พ้องกับอะไรเลย และไล่ค่าบน/ล่างได้ชัด */
  s += `<g id="kgWoodPile">`;
  let ws = 91;
  const wr = () => (ws = (ws * 1103515245 + 12345) >>> 0) / 4294967296;
  const X0 = 246, X1 = 416;
  for (let row = 0; row < 7; row++) {
    const y = 604 - row * 15.5;
    let x = X0 + wr() * 5;
    while (x < X1 - 18) {
      const len = Math.min(26 + wr() * 62, X1 - x);
      const h = 6.2 + wr() * 1.6;
      s += `<rect${F(C.timber1)} x="${n2(x)}" y="${n2(y - h)}" width="${n2(len)}" height="${n2(h * 2)}" rx="${n2(h)}"/>`;
      s += `<path${F(C.timber0, ' opacity=".7"')} d="M${n2(x + 2)} ${n2(y + h * .3)} H${n2(x + len - 2)} V${n2(y + h * .82)} H${n2(x + 2)} Z"/>`;
      s += `<path${S(C.timber2, 1.1, ' opacity=".5" stroke-linecap="round"')} d="M${n2(x + 4)} ${n2(y - h * .52)} H${n2(x + len - 4)}"/>`;
      s += `<path${S(C.fire2, 1, ' opacity=".14" stroke-linecap="round"')} d="M${n2(x + 3)} ${n2(y - h * .1)} H${n2(x + len * .45)}"/>`;
      // หน้าตัดปลายท่อน: วงรีเล็กที่ปลายซ้าย บอกว่าเป็นทรงกระบอกจริง
      s += ellipse(x + 1.5, y, 2.2, h * .92, C.timber0, ' opacity=".85"');
      x += len + 2.5 + wr() * 6;
    }
  }
  // โครงไม้รับกอง: ทำให้กองมีเหตุผลที่จะตั้งอยู่ ไม่ใช่ลอยติดผนัง
  s += rect(236, 610, 190, 8, C.timber1);
  s += rect(236, 610, 190, 2, C.timber2, ' opacity=".4"');
  s += `<path${F(C.timber1)} d="M236 496 h10 v116 h-10 Z M416 496 h10 v116 h-10 Z"/>`;
  s += `<path${F(C.timber2, ' opacity=".3"')} d="M236 496 h10 v3 h-10 Z M416 496 h10 v3 h-10 Z"/>`;
  s += `<path${F(C.shadow, ' opacity=".45"')} d="M236 604 H426 V618 H236 Z"/>`;
  s += `</g></g>`;
  return s;
}

/* ── พื้น: มืดลงเข้าหาผู้ดู เส้นเข้าจุดรวมสายตาแล้วจางหาย ────────────── */
function floor() {
  let s = `<g id="kgFloor">`;
  s += rect(0, FLOOR_Y, W, H - FLOOR_Y, C.floor0);
  s += `<path${F(C.floor1)} d="M0 612 H440 V646 C332 634 108 634 0 650 Z"/>`;

  // เส้นแผ่นพื้นวิ่งเข้าจุดรวมสายตา — จางลงเมื่อออกห่างจากแกนกลาง
  const vp = { x: 208, y: FLOOR_Y };
  for (let i = -7; i <= 8; i++) {
    const op = (0.42 - Math.abs(i) * 0.042).toFixed(3);
    if (+op <= 0.03) continue;
    s += `<path${S(C.floor2, 1.1, ` opacity="${op}"`)} d="M${vp.x} ${vp.y} L${vp.x + i * 74} ${H}"/>`;
  }
  // รอยต่อหัวแผ่น: ถี่ตรงขอบฟ้า ห่างขึ้นเมื่อเข้าใกล้ผู้ดู
  [620, 632, 652, 686, 738, 812].forEach((y, i) => {
    s += `<path${S(C.floor2, 1.1, ` opacity="${(0.34 - i * 0.045).toFixed(3)}"`)} d="M0 ${y} C120 ${y - 4} 320 ${y - 4} 440 ${y}"/>`;
  });

  // ลานหินกันความร้อนใต้เตา: รอยต่อไม่เป็นตาราง
  s += `<path${F(C.iron1)} d="M28 600 H222 L262 700 H0 Z"/>`;
  s += `<path${S(C.iron2, 1.2, ' opacity=".55"')} d="M28 600 H222 M12 636 C74 630 190 630 238 638 M0 676 C70 666 214 666 252 678 M84 600 L66 698 M148 600 L154 700 M198 600 L232 699"/>`;
  s += `<path${F(C.fire1, ' opacity=".07"')} d="M62 612 H214 L256 706 C190 676 122 648 62 640 Z"/>`;

  // ขอบล่างจมมืด: กันพื้นกลายเป็นกระดาษกราฟเต็มจอ
  s += rect(0, FLOOR_Y, W, H - FLOOR_Y, "url(#kgFloorFade)");
  s += `</g>`;
  return s;
}

/* ── เตา: มวลเอกก้อนเดียวของฉาก ─────────────────────────────────────── */
function kiln() {
  let s = `<g id="kgKiln">`;

  /* ปล่องอิฐ วาดก่อน = อยู่หลังตัวเตา และทะลุออกนอกเฟรมด้านบน
     ได้สองอย่างพร้อมกัน: เงาตัดไม่ปิดเป็นทรงขวด และแถบบนที่การ์ดบังอยู่แล้วไม่เสียเปล่า
     ต้องอ่านออกว่าเป็น "ปล่องก่ออิฐ" ไม่ใช่ "ท่อเตาเหล็ก" -> กว้าง สอบชัด มีแนวอิฐ */
  s += `<path${F(C.clay0)} d="M90 350 H160 L147 -14 H103 Z"/>`;
  s += `<path${F(C.clay1)} d="M97 350 H154 L144 -14 H106 Z"/>`;
  s += `<path${F(C.clay3, ' opacity=".18"')} d="M98 350 H112 L108 -14 H105 Z"/>`;
  s += `<path${F(C.shadow, ' opacity=".42"')} d="M136 350 H160 L147 -14 H134 Z"/>`;
  s += `<g clip-path="url(#kgFlueClip)">`;
  for (let y = 336; y > -14; y -= 26) {
    s += `<path${S(C.clay0, 1.9, ' opacity=".7"')} d="M84 ${y} H166"/>`;
    s += `<path${S(C.clay3, .7, ' opacity=".2"')} d="M84 ${n2(y - 2)} H166"/>`;
  }
  s += `</g>`;
  // ห่วงเหล็กรัดปล่อง: กว้างกว่าปล่องเล็กน้อยทั้งสองข้าง จึงอ่านเป็นรัดจากภายนอก
  [92, 206].forEach(y => {
    const hw = n2(35 - y * 0.04);
    s += `<path${F(C.iron0)} d="M${n2(KX - hw - 4)} ${y} H${n2(KX + hw + 4)} V${y + 12} H${n2(KX - hw - 4)} Z"/>`;
    s += `<path${F(C.iron2, ' opacity=".45"')} d="M${n2(KX - hw - 4)} ${y} H${n2(KX + hw + 4)} V${y + 2.6} H${n2(KX - hw - 4)} Z"/>`;
    s += circle(KX - hw + 1, y + 6, 1.9, C.gold0) + circle(KX + hw - 1, y + 6, 1.9, C.gold0);
  });
  // แผ่นปิดรอยต่อตรงคาน = เหตุผลว่าปล่องทะลุหลังคาไปจริง
  s += rect(88, 260, 74, 32, C.iron0);
  s += rect(88, 260, 74, 3, C.iron2, ' opacity=".5"');
  s += rect(88, 289, 74, 3, C.shadow, ' opacity=".6"');
  [94, 156].forEach(x => s += circle(x, 276, 2.2, C.gold0));
  // คันบังคับแดมเปอร์ — ชิ้นเดียวในปล่องที่ขยับได้
  s += `<g transform="translate(159 218)"><g class="kgBellowsLid">`;
  s += `<path${S(C.iron2, 2.6, ' stroke-linecap="round"')} d="M0 0 H11"/>`;
  s += circle(13, -.5, 3.4, C.iron1) + circle(13, -.5, 1.4, C.gold0);
  s += `</g></g>`;

  // เงาสัมผัสพื้น (ข้อ 2)
  s += ellipse(KX, 646, 108, 17, C.shadow, ' opacity=".7"');

  // ฐานหิน
  s += `<path${F(C.iron0)} d="M28 598 H222 L230 648 H20 Z"/>`;
  s += `<path${F(C.iron1)} d="M32 601 H218 L222 612 H28 Z"/>`;

  // เปลือกดิน: ไล่ค่าเป็นขั้น ไม่ใช่ gradient นุ่มบนวัตถุ (ข้อ 4)
  s += `<path${F(C.clay0)} d="${kilnBodyPath}"/>`;
  s += `<path${F(C.clay1)} d="M47 640 V476 C47 410 63 373 92 353 L92 344 H158 L158 353 C187 373 203 410 203 476 V640 Z"/>`;
  s += `<path${F(C.clay2)} d="M57 636 V476 C57 418 69 383 92 360 C85 427 89 532 103 638 Z"/>`;
  s += `<path${F(C.clay3, ' opacity=".22"')} d="M62 464 C70 402 88 368 107 354 C97 422 99 536 111 638 H72 Z"/>`;

  s += `<g clip-path="url(#kgKilnClip)">`;
  // ชั้นอิฐโค้งตามผิวโดม + รอยต่อสลับแถว
  [374, 402, 432, 464, 499, 537, 578, 620].forEach((y, i) => {
    s += `<path${S(C.clay0, 2, ' opacity=".78"')} d="M34 ${y} C80 ${y - 9} 170 ${y - 9} 216 ${y}"/>`;
    s += `<path${S(C.clay3, .8, ' opacity=".24"')} d="M38 ${y - 2} C84 ${y - 10} 168 ${y - 10} 212 ${y - 2}"/>`;
    const xs = i % 2 ? [64, 114, 168] : [88, 141, 194];
    xs.forEach(x => s += `<path${S(C.clay0, 1.6, ' opacity=".68"')} d="M${x} ${y - 29} L${x - 2 + (i % 3)} ${y - 1}"/>`);
  });
  // เขม่าที่ปากเตา: บอกว่าเตานี้ถูกใช้มาหลายปี
  s += `<path${F(C.shadow, ' opacity=".2"')} d="M74 508 C75 442 94 402 125 384 C154 398 175 442 179 510 C153 492 102 492 74 508 Z"/>`;
  // แสงไฟอาบเปลือกดินรอบปาก
  s += `<ellipse fill="url(#kgKilnWarm)" cx="${KX}" cy="536" rx="124" ry="152"/>`;
  s += `</g>`;

  // สายรัดเหล็ก
  [468, 596].forEach(y => {
    s += `<path${F(C.iron0)} d="M42 ${y} C86 ${y - 8} 176 ${y - 8} 208 ${y} V${y + 11} C170 ${y + 2} 84 ${y + 2} 42 ${y + 11} Z"/>`;
    s += `<path${S(C.iron2, 1.2, ' opacity=".58"')} d="M44 ${y + 2} C90 ${y - 5} 174 ${y - 5} 206 ${y + 2}"/>`;
    [60, 92, 125, 158, 190].forEach(x => s += circle(x, y + 5.5, 2.2, C.gold0));
  });

  /* ขอบเรืองแสงเย็นจากหน้าต่างที่ขอบขวาของเตา
     = ตัวแยกวัตถุออกจากผนังสีใกล้กัน ทางที่ 3 ต่อจากค่าและความอิ่มสี (ข้อ 15) */
  s += `<path${S(C.moon, 2.4, ' opacity=".3" stroke-linecap="round"')} d="M206 456 C211 496 211 574 210 636"/>`;
  s += `<path${S(C.moon, 1.7, ' opacity=".22" stroke-linecap="round"')} d="M162 346 C184 364 198 396 204 432"/>`;

  // ปากเตา: ซุ้มเหล็ก + อิฐทนไฟเรียงรัศมี
  s += `<path${F(C.iron0)} d="M68 590 L68 500 C68 450 93 424 125 424 C157 424 182 450 182 500 L182 590 Z"/>`;
  s += `<path${F(C.gold0, ' opacity=".5"')} d="M74 588 L74 501 C74 456 96 430 125 430 C154 430 176 456 176 501 L176 588 Z"/>`;
  s += `<path${F(C.shadow)} d="${fireOpeningPath}"/>`;
  for (let i = 0; i < 13; i++) {
    const a = Math.PI + i * Math.PI / 12;
    const x1 = KX + Math.cos(a) * 44, y1 = 500 + Math.sin(a) * 62;
    const x2 = KX + Math.cos(a) * 55, y2 = 500 + Math.sin(a) * 74;
    s += `<path${S(i % 2 ? C.clay2 : C.clay3, 7, ' stroke-linecap="butt"')} d="M${n2(x1)} ${n2(y1)} L${n2(x2)} ${n2(y2)}"/>`;
    s += `<path${S(C.clay0, 1.1, ' opacity=".7"')} d="M${n2(x1)} ${n2(y1)} L${n2(x2)} ${n2(y2)}"/>`;
  }
  s += `<path${S(C.iron2, 2.2)} d="M83 582 V500 C83 458 102 438 125 438 C148 438 167 458 167 500 V582"/>`;

  /* ลายฝังทอง 5 ดวง เรียงเป็นพัดล้อมปากเตา — รางวัลจึงอยู่ "รอบไฟ" ไม่ใช่ลอยบนไหล่
     ลายจางมีอยู่เสมอ ภารกิจจริงเป็นตัวไล่เติมทองทีละดวง */
  const seals = [
    [56, 470, "M-7 6 C-5-4 1-7 7-8 C2-3 1 2 7 7 C1 4-3 5-7 6"],
    [78, 424, "M-8 4 C-3-2 2-2 8 4 M-8-2 C-3-8 2-8 8-2"],
    [125, 404, "M0-9 C5-4 8 1 7 8 C2 5-2 5-7 8 C-8 1-5-4 0-9"],
    [172, 424, "M-8 5 L0-8 L8 5 L4 5 L0-1 L-4 5 Z"],
    [194, 470, "M-8 6 C-2 2-2-2 0-8 C2-2 2 2 8 6 C3 5-3 5-8 6"],
  ];
  seals.forEach(([x, y, d], i) => {
    s += circle(x, y, 12, C.clay0, ' opacity=".92"');
    s += circle(x, y, 9.5, C.iron0);
    s += `<path${S(C.gold0, 2.5, ' opacity=".4" stroke-linecap="round" stroke-linejoin="round"')} transform="translate(${x} ${y})" d="${d}"/>`;
    s += `<path class="kgState kgInlay" data-kg-step="${i + 1}" pathLength="1"${S(C.gold2, 2.15, ' stroke-linecap="round" stroke-linejoin="round"')} transform="translate(${x} ${y})" d="${d}"/>`;
    s += circle(x - 3, y - 4, 1.1, C.clay3, ' opacity=".4"');
  });

  // ตะแกรง ถ่าน เปลวไฟ
  [96, 111, 125, 139, 154].forEach(x => s += `<path${S(C.iron2, 2.1)} d="M${x} 548 V580"/>`);
  s += `<path${S(C.iron2, 2.8)} d="M88 554 H162 M86 569 H164"/>`;
  [95, 110, 125, 141, 156].forEach((x, i) => s += ellipse(x, 562 - (i % 2) * 4, 7, 4, C.fire0, ' opacity=".9"'));
  [101, 118, 134, 150].forEach((x, i) => s += circle(x, 556 - (i % 2) * 3, 3.2, C.fire2, ' opacity=".85"'));
  s += `<path${F(C.fire0)} d="M90 551 C82 513 101 494 103 466 C115 486 120 510 114 532 C126 505 135 484 132 452 C154 486 165 517 154 551 Z"/>`;
  s += `<path class="kgFlame kgFlame1"${F(C.fire1)} d="M101 551 C94 520 109 503 112 477 C123 497 129 523 120 551 Z"/>`;
  s += `<path class="kgFlame kgFlame2"${F(C.fire2)} d="M122 551 C116 525 130 509 134 487 C145 510 145 532 137 551 Z"/>`;
  s += `<path class="kgFlame kgFlame3"${F(C.fire3)} d="M122 551 C121 535 128 526 132 514 C138 528 136 541 133 551 Z"/>`;

  // ไอความร้อน: เส้นล้วน ไม่ผูก filter กับโหนดที่ขยับ (ข้อ 34)
  s += `<g${S(C.fire2, 1.8, ' opacity=".26" stroke-linecap="round"')}>`;
  s += `<path class="kgHeat kgHeat1" d="M92 412 C80 396 96 384 88 366"/>`;
  s += `<path class="kgHeat kgHeat2" d="M126 398 C140 380 118 366 130 348"/>`;
  s += `<path class="kgHeat kgHeat3" d="M160 412 C173 394 157 382 168 364"/>`;
  s += `</g>`;
  s += `</g>`;
  return s;
}

/* ── โต๊ะซ่อม: ถาดพื้นหน้าขวาของแจกัน (แป้นเขียนเส้นทอง กระปุกผงทอง พู่กัน) ── */
function repairTray() {
  /* รอบแรกวางถาดเครื่องมือ (คีม พู่กัน แป้นหมุน) ไว้ตรงนี้ แล้วมันอ่านเป็น "ของหกเลอะพื้น"
     เพราะทุกชิ้นเล็กพอกันและไม่มีชิ้นไหนมีเงาที่จำได้
     เปลี่ยนของ (ข้อ 24): ใช้ "ถ้วยชาที่ซ่อมแล้ว" ใบเล็กแทน — เงาถ้วยอ่านออกทันที
     ได้ขนาดที่สามในฉาก (เตาใหญ่ / ไหกลาง / ถ้วยเล็ก) และย้ำธีมซ้ำโดยไม่เพิ่มของใหม่ */
  let s = `<g id="kgTray">`;
  s += ellipse(163, 744, 62, 13, C.shadow, ' opacity=".6"');
  // ม้าเตี้ยไม้
  s += `<path${F(C.timber1)} d="M110 712 H216 L224 738 H103 Z"/>`;
  s += `<path${F(C.timber2, ' opacity=".7"')} d="M110 712 H216 L218 718 H108 Z"/>`;
  s += `<path${F(C.timber0)} d="M112 738 h9 l-3 12 h-8 Z M207 738 h9 l4 12 h-9 Z"/>`;
  // แป้นเขียนเส้นทอง: ขีดบอกองศาที่ขอบ หมุนช้า
  s += ellipse(163, 709, 47, 11, C.iron0);
  s += ellipse(163, 706, 44, 10, C.gold0);
  /* 🔴 หมุนวงที่ "เรียงเป็นวงรี" ด้วย CSS rotate ไม่ได้ — พอหมุน 90 องศา ขีดที่เคยอยู่ริมซ้าย
     จะกระเด็นขึ้นไปอยู่เหนือแป้น (เห็นเป็นไม้ขีดหล่นรอบถ้วย)
     ต้องเรียงขีดบน "วงกลม" แล้วเอาการบีบให้แบนไปไว้ที่ transform ของพ่อ
     การหมุนจึงเกิดในสเปซวงกลม แล้วค่อยถูกบีบเป็นวงรี = แป้นหมุนในเปอร์สเปกทีฟจริง */
  s += `<g transform="translate(163 706) scale(1 .225)"><g class="kgWheelMarks">`;
  for (let i = 0; i < 14; i++) {
    const a = i * Math.PI / 7;
    s += `<path${S(i % 2 ? C.gold1 : C.gold2, 5.5, ' opacity=".8" stroke-linecap="round"')} d="M${n2(Math.cos(a) * 35)} ${n2(Math.sin(a) * 35)} L${n2(Math.cos(a) * 42)} ${n2(Math.sin(a) * 42)}"/>`;
  }
  s += `</g></g>`;
  s += ellipse(163, 705, 34, 7.6, C.iron1);
  s += `<path${S(C.gold2, 1.2, ' opacity=".45"')} d="M129 705 A34 7.6 0 0 0 197 705"/>`;
  // ถ้วยชาที่ซ่อมแล้ว: รอยทองอยู่ถาวร (เป็นงานที่ "ทำเสร็จไปแล้ว" ไม่ผูกกับ state วันนี้)
  s += `<g transform="translate(163 702)">`;
  s += `<path${F(C.porcelain1)} d="M-25-4 C-22 20 22 20 25-4 C14 3-14 3-25-4 Z"/>`;
  s += `<path${F(C.ink, ' opacity=".5"')} d="M-25-4 C-22 20 22 20 25-4 C14 3-14 3-25-4 Z" transform="scale(1,1)" clip-path="url(#kgBowlLeft)"/>`;
  s += `<path${F(C.cobalt0)} d="M-25-5 C-14 2 14 2 25-5 C14-11-14-11-25-5 Z"/>`;
  s += `<path${S(C.cobalt2, 1.4, ' opacity=".7"')} d="M-20-5 C-11 0 11 0 20-5"/>`;
  s += `<path${S(C.gold2, 2.2, ' stroke-linecap="round" stroke-linejoin="round"')} d="M-6-3 C-3 4-7 9-4 15 M-4 6 C0 5 5 8 8 12"/>`;
  s += `<path${S(C.gold2, 1.6, ' opacity=".9" stroke-linecap="round"')} d="M-25-5 C-19-2-14 0-9 1"/>`;
  s += `<path${S(C.fire2, 1.8, ' opacity=".4" stroke-linecap="round"')} d="M22 0 C21 7 16 13 10 16"/>`;
  s += `</g>`;
  // กระปุกผงทองใบเล็กหลังม้า
  s += rect(198, 686, 20, 12, C.clay0);
  s += rect(200, 682, 16, 5, C.gold0);
  s += circle(204, 684, 1.4, C.gold2) + circle(212, 684, 1.4, C.gold2);
  s += `</g>`;
  return s;
}

/* ── แจกันที่ซ่อมแล้ว: ของที่สว่างที่สุดรองจากไฟ อยู่พื้นหน้าซ้าย ─────
   กลางคืน ของขาวห้ามเป็นสีขาวแบน: ด้านขวา (ฝั่งเตา) อุ่นและสว่าง
   ด้านซ้ายจมเงาน้ำเงิน -> ได้ทั้งรูปทรงและได้เหตุผลว่าแสงมาจากไหน */
function vessel() {
  let s = `<g id="kgVessel" transform="translate(${VTX} ${VTY}) scale(${VS})">`;
  s += ellipse(64, 561, 52, 10, C.shadow, ' opacity=".8"');
  s += `<path${F(C.porcelain1)} d="${vesselPath}"/>`;
  s += `<g clip-path="url(#kgVesselClip)">`;
  s += `<path${F(C.porcelain2, ' opacity=".72"')} d="M72 337 C105 389 108 481 84 548 L104 548 C128 489 126 392 88 350 Z"/>`;
  s += `<path${F(C.cobalt0)} d="M5 449 C35 434 78 446 120 424 V571 H4 Z"/>`;
  s += `<path${F(C.cobalt1)} d="M4 469 C36 451 78 467 120 442 V463 C83 488 37 469 5 489 Z"/>`;
  s += `<path${F(C.cobalt2)} d="M3 500 C36 481 77 500 119 475 V489 C81 514 38 495 5 515 Z"/>`;
  s += `<path${F(C.cobalt1)} d="M4 533 C40 514 79 533 117 508 V526 C79 548 39 532 7 548 Z"/>`;

  // ลายคลื่นเซการิฮะ: ยอดคลื่นเหลื่อมแถวตามความโค้งของตัวไห
  s += `<g${S(C.cobalt3, 2, ' opacity=".85" stroke-linecap="round"')}>`;
  for (let row = 0; row < 3; row++) {
    const y = 468 + row * 27, off = row % 2 ? 12 : 0;
    for (let x = 8 + off; x < 118; x += 24) {
      s += `<path d="M${x} ${y + 10} Q${x + 6} ${y} ${x + 12} ${y + 10} Q${x + 18} ${y} ${x + 24} ${y + 10}"/>`;
      s += `<path${S(C.porcelain2, .8, ' opacity=".42"')} d="M${x + 4} ${y + 10} Q${x + 9} ${y + 3} ${x + 14} ${y + 10}"/>`;
    }
  }
  s += `</g>`;
  /* เดิมมีลายเถาวัลย์ครามบนไหล่ — ถอดออก 2026-08-20
     เพราะเส้นโค้งสีเข้มบนพื้นขาวไปชนกับ "รอยร้าว" ที่รอเติมทอง
     ผลคือทั้งใบอ่านเป็นกิ่งไม้พันไห ไม่ใช่ไหที่แตกแล้วรอซ่อม
     ตัวตนของธีมอยู่ที่รอยร้าว ลายประดับต้องยอมถอยให้ (ข้อ 11) */
  // ชั้นแสง/เงา ทับลายทั้งหมด — วางท้ายสุดในกรอบตัด จึงคุมค่าทั้งใบได้จริง
  s += rect(0, 330, 130, 245, "url(#kgVesselShade)");
  s += rect(0, 330, 130, 245, "url(#kgVesselWarm)");
  s += `</g>`;

  s += `<path${S(C.cobalt0, 3.2, ' stroke-linejoin="round"')} d="${vesselPath}"/>`;
  s += `<path${S(C.fire2, 2.2, ' opacity=".55" stroke-linecap="round"')} d="M88 378 C102 398 116 420 118 452 C120 486 116 522 104 546"/>`;
  s += `<path${F(C.gold0)} d="M44 337 C53 333 76 333 85 337 L82 346 C72 350 56 350 46 346 Z"/>`;
  s += `<path${F(C.gold2, ' opacity=".84"')} d="M47 337 C57 334 73 334 82 338 L80 341 C71 339 58 339 48 341 Z"/>`;
  s += `<path${S(C.gold0, 2)} d="M42 557 C54 561 78 561 98 557"/>`;

  const seams = [
    [1, "M64 345 C64 370 57 384 62 405 C67 423 62 438 64 452"],
    [2, "M62 405 C50 411 41 424 33 436 C27 445 21 454 15 460"],
    [3, "M64 452 C79 449 90 458 99 473 C104 483 108 492 115 500"],
    [4, "M64 451 C57 471 63 486 57 505 C53 522 56 540 50 553"],
    [5, "M57 505 C45 506 36 517 31 530 M59 487 C72 486 81 496 87 509"],
  ];
  seams.forEach(([step, d]) => {
    s += `<path${S(C.porcelain2, vw(1.5), ' opacity=".2" stroke-linecap="round" stroke-linejoin="round"')} d="${d}" transform="translate(1.2 1)"/>`;
    s += `<path${S(C.ink, vw(2.1), ' opacity=".62" stroke-linecap="round" stroke-linejoin="round"')} d="${d}"/>`;
    s += `<path class="kgState kgSeam" data-kg-step="${step}" pathLength="1"${S(C.gold2, vw(3.1), ' stroke-linecap="round" stroke-linejoin="round"')} d="${d}"/>`;
  });

  s += `<g transform="translate(64 452)"><g class="kgCrest" data-kg-complete="true">`;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    s += `<path${S(C.gold2, vw(i % 2 ? 1.3 : 2), ' stroke-linecap="round"')} d="M${n2(Math.cos(a) * 8)} ${n2(Math.sin(a) * 8)} L${n2(Math.cos(a) * (i % 2 ? 13 : 17))} ${n2(Math.sin(a) * (i % 2 ? 13 : 17))}"/>`;
  }
  s += circle(0, 0, 4.4, C.gold2) + circle(-1.4, -1.5, 1.2, C.porcelain2, ' opacity=".9"');
  s += `</g></g></g>`;
  return s;
}

/* ── ฝุ่นทอง + สะเก็ดไฟ: คาบไม่พร้อมกันสักตัว ────────────────────────── */
function particles() {
  let s = `<g id="kgParticles">`;
  const motes = [[22, 470, 1.3], [40, 388, 1.1], [64, 318, 1.4], [172, 430, 1.2], [196, 336, 1], [206, 520, 1.2], [30, 660, 1.4], [176, 640, 1.1]];
  motes.forEach((p, i) => s += circle(p[0], p[1], p[2], C.gold2, ` class="kgMote kgMote${i + 1}" opacity=".6"`));
  const embers = [[100, 543, 1.5], [122, 532, 1.1], [148, 542, 1.3], [166, 524, 1.1], [110, 505, .9], [156, 498, .8]];
  embers.forEach((p, i) => s += circle(p[0], p[1], p[2], i % 2 ? C.fire2 : C.fire3, ` class="kgEmber kgEmber${i + 1}" opacity=".8"`));
  s += `</g>`;
  return s;
}

const defs = `<defs>
  <linearGradient id="kgWallG" x1="0" y1="0" x2=".14" y2="1">
    <stop offset="0" stop-color="${C.wall0}"/><stop offset=".55" stop-color="${C.wall1}"/><stop offset="1" stop-color="${C.wall2}"/>
  </linearGradient>
  <linearGradient id="kgWindowG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#15334A"/><stop offset=".55" stop-color="#0C2334"/><stop offset="1" stop-color="#071620"/>
  </linearGradient>
  <linearGradient id="kgFloorFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.ink}" stop-opacity="0"/><stop offset=".6" stop-color="${C.ink}" stop-opacity=".3"/><stop offset="1" stop-color="${C.ink}" stop-opacity=".7"/>
  </linearGradient>
  <linearGradient id="kgVesselShade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.ink}" stop-opacity=".72"/><stop offset=".34" stop-color="${C.ink}" stop-opacity=".34"/><stop offset=".66" stop-color="${C.ink}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="kgVesselWarm" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="${C.fire2}" stop-opacity=".34"/><stop offset=".3" stop-color="${C.fire2}" stop-opacity=".08"/><stop offset=".62" stop-color="${C.fire2}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="kgKilnWarm" cx=".5" cy=".62" r=".6">
    <stop offset="0" stop-color="${C.fire2}" stop-opacity=".3"/><stop offset=".55" stop-color="${C.fire1}" stop-opacity=".12"/><stop offset="1" stop-color="${C.fire1}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="kgSoot" cx=".5" cy="1" r=".72">
    <stop offset="0" stop-color="${C.ink}" stop-opacity=".62"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="kgFirePool" cx=".5" cy=".55" r=".5">
    <stop offset="0" stop-color="${C.fire1}" stop-opacity=".34"/><stop offset=".52" stop-color="${C.fire1}" stop-opacity=".12"/><stop offset="1" stop-color="${C.fire1}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="kgMoonPool" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.moon}" stop-opacity=".17"/><stop offset="1" stop-color="${C.moon}" stop-opacity="0"/>
  </radialGradient>
  <filter id="kgSoft" x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="24"/></filter>
  <clipPath id="kgBowlLeft"><rect x="-30" y="-14" width="24" height="40"/></clipPath>
  <clipPath id="kgFlueClip"><path d="M90 350 H160 L147 -14 H103 Z"/></clipPath>
  <clipPath id="kgKilnClip"><path d="${kilnBodyPath}"/></clipPath>
  <clipPath id="kgVesselClip"><path d="${vesselPath}"/></clipPath>
  <clipPath id="kgWinClip"><rect x="255" y="107" width="146" height="136"/></clipPath>
</defs>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="The Gilded Kiln restoration workshop at night">
<!-- สร้างจาก _gen-home-kintsugi.js — ห้ามแก้ไฟล์นี้ด้วยมือ
     เส้นพื้น y=612 · มาสคอต x 200-435 ที่ y 385-690
     มวลเอกคือเตา (x 46-204 ปากเตากลางที่ x=125) แจกันที่ซ่อมแล้วอยู่พื้นหน้าซ้าย
     ชั้น blur ทั้งหมดเป็นชั้นที่ไม่ขยับ แยกจากโหนดที่มีอนิเมชั่น -->
${defs}
${wall()}
${lightPools()}
${windowPanel()}
${rightWall()}
${floor()}
${kiln()}
${repairTray()}
${vessel()}
${particles()}
</svg>
`;

fs.writeFileSync(OUT, svg, "utf8");
console.log(`Wrote ${OUT} (${Buffer.byteLength(svg)} bytes)`);
