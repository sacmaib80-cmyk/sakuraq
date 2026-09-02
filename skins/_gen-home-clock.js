/* สร้าง www/skins/home-clock.svg — ฉากหน้า Home ชุด "ห้องช่างนาฬิกา"
   รัน:  node skins/_gen-home-clock.js
   แก้ "ตัวเลข" ที่ไฟล์นี้แล้วรันใหม่ ห้ามแก้ .svg ด้วยมือ เดี๋ยวหลุดกัน

   ─── สัญญาพิกัด (วัดจากแอปจริงด้วย measure-ui.js / measure-fox.js ไม่ได้กะเอา) ───
   viewBox 440x860 · เส้นพื้น y=612
   มาสคอตจริงกิน x 200-435 ที่ y 385-690   (ยอดหู y389 · เท้า y611-688 แล้วแต่ความสูงจอ)
   การ์ดคะแนน + ปุ่ม CTA ทับได้ถึง y=320 บนจอเตี้ยสุด 360x640 กว้าง x 22-409
   ปุ่มลูกเต๋าลอยที่ x 337-415 y 677-768 · แถบเมนูล่างกินตั้งแต่ y 762 ลงไป
   => โซนที่เห็นเสมอทุกจอ = x 0-198 ที่ y 320-612  บวกแถบ y 320-385 เต็มความกว้าง
      ของสำคัญทุกชิ้นต้องอยู่ในโซนนี้ ของที่สูงกว่า y=320 ถือเป็นของแถมของจอสูง

   ─── กฎกลางของชุด (เอาไปตรวจของทุกชิ้น) ───
   ห้องนี้มืดทั้งห้อง แสงมาจาก "ของที่ทำหน้าที่นับเวลา" เท่านั้น
   ตัวเรือนนาฬิกา = โคมดวงเดียวของห้อง แสงออกจากจุด (99,336)
   => ทุกชิ้นสว่างด้านที่หันเข้าหานาฬิกา เงาทอดออกจากนาฬิกาเสมอ
   => สีเรืองมิ้นต์ ใช้ได้เฉพาะของที่บอกเวลา และเฉพาะบน "หน้าปัดสีเข้ม" เท่านั้น
      (รอบแรกเอาไปแปะบนหน้าปัดสีงาช้าง -> อ่านเป็นลูกอม เพราะของเรืองแสงบนพื้นสว่างไม่มีความหมาย)

   ─── ลำดับวัสดุ (ของที่อยู่ติดกันห้ามเป็นวัสดุเดียวกัน) ───
   ปูนผนังหม่น < ไม้วอลนัต(โครง) < เหล็กรมดำ(เข็ม/ขีด) < ทองเหลือง(เครื่อง) < งาช้าง(หน้าปัด)
   ⚠ ปุ่ม CTA ของแอปเป็นเขียวสด #22c55e -> ห้ามใช้เขียวสดในฉากนี้เด็ดขาด ปุ่มจะจมหาย

   ─── บทเรียนที่จ่ายไปแล้วในรอบ 1 (อย่าทำซ้ำ) ───
   1. พื้นที่ทำเป็นแถวนอน + รอยต่อสลับแถว = ตาอ่านเป็น "ผนังอิฐ" ทันที
      -> พื้นต้องเป็นแผ่นวิ่งเข้าหาจุดรวมสายตาบนเส้นขอบฟ้า (y=612) ถึงจะอ่านเป็นพื้น
   2. คราบปูนที่ทำเป็นวงรีจาง ๆ = ตาอ่านเป็น "จานบิน/ก้อนลอย" -> ใช้จุดเล็กกระจายแทน
   3. ผนังไล่เป็นแถบขอบคม = เห็นเส้นตรงพาดขวางจอ -> ผนังคือ "สนามแสง" ใช้ gradient ได้ (ข้อ 4 ของ ART-PROCESS
      สงวน gradient ให้แสง ซึ่งผนังที่ไล่แสงก็คือแสง) ส่วน "วัตถุ" ยังต้องไล่เป็นขั้นเหมือนเดิม

   ─── สีทุกตัวออกเป็น attribute พร้อม fallback ตาม _ART-PROCESS ข้อ 7 ───
   คลาสถูกใช้เฉพาะชิ้นที่ต้องขยับเท่านั้น */

const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "home-clock.svg");
const N2 = n => Math.round(n * 100) / 100;
const P = (cx, cy, r, a) => [N2(cx + r * Math.cos(a)), N2(cy + r * Math.sin(a))];
const D2R = Math.PI / 180;

/* ═════════ จานสี ═════════ */
const C = {
  speck: "var(--hs-speck,#6A5A72)",
  dado: "var(--hs-dado,#31221F)", dadoLine: "var(--hs-dado-lo,#1D1412)", dadoHi: "var(--hs-dado-hi,#4A3329)",
  skirt: "var(--hs-skirt,#241916)",
  floor: "var(--hs-floor,#3A281E)", floorLine: "var(--hs-floor-lo,#1D130E)", floorHi: "var(--hs-floor-hi,#553B29)",
  woodHi: "var(--hs-wood-hi,#6B4632)", woodLo: "var(--hs-wood-lo,#2A1811)",
  inner: "var(--hs-inner,#120C10)",
  plate: "var(--hs-plate,#1E2638)", plateHi: "var(--hs-plate-hi,#2E3A54)",
  brass: "var(--hs-brass,#C1904A)", brassHi: "var(--hs-brass-hi,#F5D794)", brassLo: "var(--hs-brass-lo,#7A5623)",
  steel: "var(--hs-steel,#232C44)", steelHi: "var(--hs-steel-hi,#6E82AC)",
  lume: "var(--hs-lume,#A8ECDC)",
  glass: "var(--hs-glass,#CFE4F2)",
  chain: "var(--hs-chain,#6E5B44)",
  shadow: "var(--hs-shadow,#080508)",
  ivory: "var(--hs-ivory,#EFDFBE)", ivoryLo: "var(--hs-ivory-lo,#C4AC84)",
  faceDark: "var(--hs-face-dark,#191A26)",
};
const F = (fill, extra) => ' fill="' + fill + '"' + (extra || "");
const S = (stroke, w, extra) => ' fill="none" stroke="' + stroke + '" stroke-width="' + w + '"' + (extra || "");

/* ═════════ พารามิเตอร์ ═════════ */
const W = 440, H = 860, GROUND = 612;
const CX = 99;
const DIAL = { x: CX, y: 360, rOut: 62, rIn: 43 };
const CASE = {
  pedTop: 220, pedBot: 274,
  hoodTop: 274, hoodBot: 438, hoodX1: 6, hoodX2: 192,
  trunkTop: 438, trunkBot: 574, trunkX1: 16, trunkX2: 182,
  plinthTop: 574, plinthBot: GROUND, plinthX1: 2, plinthX2: 196,
  glassPad: 14
};
/* ห้องเครื่องหลังหน้าปัด — คำนวณจาก CASE ห้ามใส่เลขตายตัว ไม่งั้นขยับตัวเรือนแล้วหลุดกัน */
const HOODIN = { x: 20, y: CASE.hoodTop + 12, w: 158, h: CASE.hoodBot - CASE.hoodTop - 26 };
const PEND = { pivotY: 374, bobY: 526, bobR: 21, swing: 6 };
const SHELF = { y: 336, x1: 226, x2: 440 };
const MODULE = 3.1;
const gearR = N => MODULE * N / 2;
const TIME = { h: 10, m: 9 };

/* ═════════ เฟือง ═════════
   ขบกันได้ต่อเมื่อ module เท่ากันและระยะศูนย์กลาง = R1+R2
   อนิเมชั่น steps(N) ยาว N วินาที สลับทิศ -> ทุกตัวขยับ 1 ซี่ต่อ 1 ติ๊ก = ขบกันตลอดกาล
   ตำแหน่งลูกคำนวณจากมุมที่ตรงกับซี่ของแม่พอดี ไม่ใช่กะพิกัดเอง ไม่งั้นซี่จะเหลื่อม */
function gearTeeth(cx, cy, N, { add = 0.6, ded = 0.78, tipF = 0.16, rootF = 0.28 } = {}) {
  const R = gearR(N), Ro = R + add * MODULE, Rr = R - ded * MODULE, s = 2 * Math.PI / N;
  let d = "M " + P(cx, cy, Rr, -0.5 * s).join(" ");
  for (let i = 0; i < N; i++) {
    const a = i * s;
    d += " A " + N2(Rr) + " " + N2(Rr) + " 0 0 1 " + P(cx, cy, Rr, a - rootF * s).join(" ");
    d += " L " + P(cx, cy, Ro, a - tipF * s).join(" ");
    d += " A " + N2(Ro) + " " + N2(Ro) + " 0 0 1 " + P(cx, cy, Ro, a + tipF * s).join(" ");
    d += " L " + P(cx, cy, Rr, a + rootF * s).join(" ");
  }
  d += " A " + N2(Rr) + " " + N2(Rr) + " 0 0 1 " + P(cx, cy, Rr, 2 * Math.PI - 0.5 * s).join(" ") + " Z";
  return d;
}
function ringRev(cx, cy, r) {
  return "M " + N2(cx + r) + " " + N2(cy) +
    " A " + N2(r) + " " + N2(r) + " 0 1 0 " + N2(cx - r) + " " + N2(cy) +
    " A " + N2(r) + " " + N2(r) + " 0 1 0 " + N2(cx + r) + " " + N2(cy) + " Z";
}
function buildTrain(first, rest) {
  const out = [{ N: first.N, cx: first.cx, cy: first.cy, phase: 0, dir: 1, R: gearR(first.N) }];
  rest.forEach(g => {
    const p = out[out.length - 1];
    const stepP = 360 / p.N, stepC = 360 / g.N;
    const A = p.phase + Math.round((g.aDeg - p.phase) / stepP) * stepP;
    const d = p.R + gearR(g.N);
    const cx = p.cx + d * Math.cos(A * D2R), cy = p.cy + d * Math.sin(A * D2R);
    const want = A + 180 + stepC / 2;
    out.push({ N: g.N, cx: N2(cx), cy: N2(cy), phase: N2(want - Math.round(want / stepC) * stepC), dir: -p.dir, R: gearR(g.N) });
  });
  return out;
}
/* cls ว่าง = เฟืองที่ไม่หมุน (ตัวที่ถอดวางไว้บนพื้น) */
function gearSVG(o, cls) {
  const { cx, cy, N, phase } = o, R = gearR(N);
  const rimIn = Math.max(3, R - MODULE * 2.2), rHub = Math.max(3.4, R * 0.18);
  const spokes = N > 20 ? 6 : (N > 12 ? 5 : 4);
  let s = cls ? '<g transform="translate(' + cx + " " + cy + ')"><g class="ckGear ' + cls + '"><g transform="translate(' + (-cx) + " " + (-cy) + ')">'
    : "<g><g><g>";
  s += '<g transform="rotate(' + phase + " " + cx + " " + cy + ')">';
  s += '<path' + F(C.brass) + ' fill-rule="evenodd" d="' + gearTeeth(cx, cy, N) + " " + ringRev(cx, cy, rimIn) + '"/>';
  if (rimIn > 6) {
    for (let k = 0; k < spokes; k++) {
      const a = k * 2 * Math.PI / spokes, wA = 0.105, wB = 0.045;
      const p1 = P(cx, cy, rHub - 0.6, a - wA), p2 = P(cx, cy, rimIn + 1, a - wB);
      const p3 = P(cx, cy, rimIn + 1, a + wB), p4 = P(cx, cy, rHub - 0.6, a + wA);
      s += '<path' + F(C.brass) + ' d="M ' + p1.join(" ") + " L " + p2.join(" ") + " L " + p3.join(" ") + " L " + p4.join(" ") + ' Z"/>';
    }
  }
  /* เสี้ยวรับแสง: ด้านที่หันเข้าหาหน้าปัด — แสงอยู่ที่ (99,336) */
  const la = Math.atan2(DIAL.y - cy, DIAL.x - cx);
  s += '<path' + F(C.brassHi, ' opacity=".6"') + ' d="M ' + P(cx, cy, R + MODULE * .55, la - 0.8).join(" ") +
    " A " + N2(R + MODULE * .55) + " " + N2(R + MODULE * .55) + " 0 0 1 " + P(cx, cy, R + MODULE * .55, la + 0.8).join(" ") +
    " L " + P(cx, cy, rimIn + 1.2, la + 0.8).join(" ") +
    " A " + N2(rimIn + 1.2) + " " + N2(rimIn + 1.2) + " 0 0 0 " + P(cx, cy, rimIn + 1.2, la - 0.8).join(" ") + ' Z"/>';
  s += '<circle' + F(C.brassHi) + ' cx="' + cx + '" cy="' + cy + '" r="' + N2(rHub) + '"/>';
  s += '<circle' + F(C.steel) + ' cx="' + cx + '" cy="' + cy + '" r="' + N2(rHub * 0.44) + '"/>';
  return s + "</g></g></g></g>";
}

/* ═════════ หน้าปัดใหญ่ ═════════ */
function chapterRing() {
  const { x, y, rOut, rIn } = DIAL;
  let s = "";
  /* ที่รองวงหน้าปัด: ต้องเป็น "วงแหวน" ไม่ใช่ "จาน" ไม่งั้นมันจะทับเครื่องที่อยู่ข้างหลังจนมองไม่เห็น
     (บั๊กรอบ 2: วาดเป็นจานแล้วห้องเครื่องหายทั้งก้อน เหลือแค่ซี่ที่โผล่พ้นวงออกมา) */
  s += '<path' + F(C.woodLo) + ' fill-rule="evenodd" d="' + ringRev(x, y, rOut + 1.5) + " " + ringRev(x, y, rIn + 0.5) + '"/>';
  s += '<path' + F("url(#ckRingG)") + ' fill-rule="evenodd" d="' + ringRev(x, y, rOut - 4) + " " + ringRev(x, y, rIn) + '"/>';
  s += '<circle' + S(C.brass, 3.4) + ' cx="' + x + '" cy="' + y + '" r="' + (rOut - 2.2) + '"/>';
  s += '<circle' + S(C.brassHi, 1.1, ' opacity=".85"') + ' cx="' + x + '" cy="' + y + '" r="' + (rOut - 4.3) + '"/>';
  s += '<circle' + S(C.brass, 2.4) + ' cx="' + x + '" cy="' + y + '" r="' + (rIn + 1.3) + '"/>';
  s += '<circle' + S(C.brassLo, 1, ' opacity=".7"') + ' cx="' + x + '" cy="' + y + '" r="' + (rIn + 2.9) + '"/>';
  /* รางนาที 60 ขีด */
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30 - Math.PI / 2, big = i % 5 === 0;
    const r1 = rOut - 7.5, r2 = r1 - (big ? 4.5 : 2.6);
    s += '<path' + S(C.steel, big ? 2 : 1, ' stroke-linecap="round"') + ' d="M ' + P(x, y, r1, a).join(" ") + " L " + P(x, y, r2, a).join(" ") + '"/>';
  }
  /* หลักชั่วโมง = แท่งเหล็กรมดำ (ไม่ใช่ lume: บนหน้าปัดสีสว่าง ของเรืองแสงไม่มีความหมาย) */
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 - Math.PI / 2, r1 = rIn + 10.5, r2 = rIn + 3.6, w = i % 3 === 0 ? 3.4 : 2.1;
    const n = [Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w];
    const A = P(x, y, r1, a), B = P(x, y, r2, a);
    s += '<path' + F(C.steel) + ' d="M ' + N2(A[0] - n[0]) + " " + N2(A[1] - n[1]) + " L " + N2(A[0] + n[0]) + " " + N2(A[1] + n[1]) +
      " L " + N2(B[0] + n[0] * .72) + " " + N2(B[1] + n[1] * .72) + " L " + N2(B[0] - n[0] * .72) + " " + N2(B[1] - n[1] * .72) + ' Z"/>';
  }
  return s;
}
/* เข็ม: มีขอบทองบาง ๆ เพื่อไม่ให้จมไปกับเครื่องที่อยู่ข้างหลัง + ไส้ lume */
function hand(cx, cy, len, deg, w, opt = {}) {
  const a = (deg - 90) * D2R, tail = len * 0.28;
  const t = P(cx, cy, len, a), b = P(cx, cy, -tail, a), q = P(cx, cy, len * 0.55, a);
  const n = [Math.cos(a + Math.PI / 2), Math.sin(a + Math.PI / 2)];
  const shape = (k) => "M " + N2(b[0] - n[0] * w * .75 * k) + " " + N2(b[1] - n[1] * w * .75 * k) +
    " L " + N2(b[0] + n[0] * w * .75 * k) + " " + N2(b[1] + n[1] * w * .75 * k) +
    " L " + N2(q[0] + n[0] * w * k) + " " + N2(q[1] + n[1] * w * k) +
    " L " + N2(t[0] + (t[0] - cx) / len * (k - 1) * w) + " " + N2(t[1] + (t[1] - cy) / len * (k - 1) * w) +
    " L " + N2(q[0] - n[0] * w * k) + " " + N2(q[1] - n[1] * w * k) + " Z";
  let s = "";
  if (opt.halo !== false) s += '<path' + F(C.brassHi, ' opacity=".55"') + ' d="' + shape(1.5) + '"/>';
  s += '<path' + F(opt.fill || C.steel) + ' d="' + shape(1) + '"/>';
  if (opt.lume) {
    const l1 = P(cx, cy, len * 0.58, a), l2 = P(cx, cy, len * 0.9, a), lw = w * 0.42;
    s += '<path' + F(C.lume) + ' d="M ' + N2(l1[0] - n[0] * lw) + " " + N2(l1[1] - n[1] * lw) +
      " L " + N2(l1[0] + n[0] * lw) + " " + N2(l1[1] + n[1] * lw) +
      " L " + N2(l2[0] + n[0] * lw * .45) + " " + N2(l2[1] + n[1] * lw * .45) +
      " L " + N2(l2[0] - n[0] * lw * .45) + " " + N2(l2[1] - n[1] * lw * .45) + ' Z"/>';
  }
  return s;
}

/* ═════════ นาฬิกาเล็กแขวนผนัง ═════════
   ต้องอ่านเป็น "นาฬิกา" ไม่ใช่ "วงกลม" -> ขอบไม้ + เข็ม 2 เข็มยาวไม่เท่ากัน + ตะปูแขวน + เงาทิ้ง
   หน้าปัดมี 2 แบบ: สีเข้ม (ใส่ lume ได้ = ยังเดินอยู่) กับสีงาช้าง (เข็มเหล็ก = หยุดแล้ว) */
function wallDial(x, y, r, hDeg, mDeg, lume) {
  const away = x < DIAL.x ? -1 : 1;
  let s = "<g>";
  s += '<ellipse' + F(C.shadow, ' opacity=".45"') + ' cx="' + N2(x + away * r * 0.3) + '" cy="' + N2(y + r * 0.3) + '" rx="' + N2(r * 1.03) + '" ry="' + N2(r * 0.99) + '"/>';
  s += '<circle' + F(C.woodLo) + ' cx="' + x + '" cy="' + y + '" r="' + N2(r) + '"/>';
  s += '<path' + S(C.woodHi, 1.5, ' opacity=".9"') + ' d="M ' + P(x, y, r - 0.8, Math.PI * 0.6).join(" ") +
    " A " + N2(r - 0.8) + " " + N2(r - 0.8) + " 0 0 1 " + P(x, y, r - 0.8, Math.PI * 1.58).join(" ") + '"/>';
  s += '<circle' + F(C.brass) + ' cx="' + x + '" cy="' + y + '" r="' + N2(r - 2.4) + '"/>';
  s += '<circle' + F(lume ? C.faceDark : C.ivory) + ' cx="' + x + '" cy="' + y + '" r="' + N2(r - 4.2) + '"/>';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, r1 = r - 5.6, r2 = r1 - (i % 3 === 0 ? 3.2 : 1.8);
    s += '<path' + S(lume ? C.lume : C.steel, i % 3 === 0 ? 1.5 : 0.9, ' stroke-linecap="round"') +
      ' d="M ' + P(x, y, r1, a).join(" ") + " L " + P(x, y, r2, a).join(" ") + '"/>';
  }
  s += hand(x, y, r * 0.44, hDeg, Math.max(1, r * 0.09), { fill: lume ? C.lume : C.steel, halo: false });
  s += hand(x, y, r * 0.7, mDeg, Math.max(0.8, r * 0.062), { fill: lume ? C.lume : C.steel, halo: false });
  s += '<circle' + F(C.brassLo) + ' cx="' + x + '" cy="' + y + '" r="' + N2(Math.max(1.2, r * 0.1)) + '"/>';
  s += '<circle' + F(C.brassLo) + ' cx="' + x + '" cy="' + N2(y - r - 2) + '" r="2.2"/>';
  return s + "</g>";
}

/* ═════════ ประกอบฉาก ═════════ */
function build() {
  const g = CASE, gx1 = g.trunkX1 + g.glassPad, gx2 = g.trunkX2 - g.glassPad;
  const train = buildTrain({ N: 24, cx: 74, cy: DIAL.y + 22 }, [
    { N: 15, aDeg: -54 }, { N: 11, aDeg: 8 }, { N: 8, aDeg: 74 }
  ]);
  const hourDeg = (TIME.h % 12 + TIME.m / 60) * 30, minDeg = TIME.m * 6;
  let s = "";

  /* ── ผนัง: gradient (ผนังคือสนามแสง ไม่ใช่วัตถุ) + จุดเกรนปูนเล็ก ๆ ── */
  s += '<rect' + F("url(#ckWallG)") + ' x="0" y="0" width="440" height="614"/>';
  let dots = "";
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 150; i++) {
    const x = N2(rnd() * 440), y = N2(rnd() * 470), r = N2(0.7 + rnd() * 1.5), o = N2(0.05 + rnd() * 0.1);
    dots += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" opacity="' + o + '"/>';
  }
  s += "<g" + F(C.speck) + ">" + dots + "</g>";

  /* ── แอ่งแสงจากนาฬิกา: กลุ่มเดียวที่ใส่ filter ได้ เพราะนิ่งสนิท (_ART-PROCESS ข้อ 34) ── */
  s += '<g filter="url(#ckSoft)">';
  s += '<ellipse' + F("url(#ckPoolG)") + ' cx="' + DIAL.x + '" cy="' + (DIAL.y + 30) + '" rx="218" ry="258"/>';
  s += '<ellipse' + F("url(#ckPoolG2)") + ' cx="' + DIAL.x + '" cy="' + DIAL.y + '" rx="116" ry="124"/>';
  s += '<ellipse' + F("url(#ckPoolG2)", ' opacity=".62"') + ' cx="' + (CX + 24) + '" cy="652" rx="212" ry="62"/>';
  s += "</g>";

  /* ── ไม้ฝาผนังท่อนล่าง + บัวเชิงผนัง ── */
  s += '<rect' + F(C.dado) + ' x="0" y="470" width="440" height="126"/>';
  for (let x = 9; x < 440; x += 27) {
    s += '<path' + S(C.dadoLine, 1.7) + ' d="M ' + x + ' 474 L ' + x + ' 594"/>';
    s += '<path' + S(C.dadoHi, 1, ' opacity=".55"') + ' d="M ' + (x + 1.9) + ' 474 L ' + (x + 1.9) + ' 594"/>';
  }
  s += '<rect' + F(C.dado) + ' x="0" y="460" width="440" height="13"/>';
  s += '<rect' + F(C.dadoHi) + ' x="0" y="460" width="440" height="2.8"/>';
  s += '<rect' + F(C.skirt) + ' x="0" y="592" width="440" height="20"/>';
  s += '<rect' + F(C.dadoHi, ' opacity=".75"') + ' x="0" y="592" width="440" height="2.8"/>';

  /* รอยของที่เคยแขวนแล้วถูกถอดไป: ผนังตรงนั้นไม่ซีดเท่ารอบข้าง + ตะปูยังคาอยู่ */
  s += '<circle' + F(C.speck, ' opacity=".085"') + ' cx="316" cy="96" r="27"/>';
  s += '<circle' + S(C.speck, 1, ' opacity=".1"') + ' cx="316" cy="96" r="27"/>';
  s += '<path' + S(C.chain, 1.4, ' opacity=".55"') + ' d="M 316 62 L 316 69"/>';

  /* ── รางแขวนรูป: เส้นยึดแนวนอนที่ทำให้กลุ่มนาฬิกาเป็น "คอลเลกชัน" ไม่ใช่ของโปรย ── */
  const RAIL = 152;
  s += '<rect' + F(C.woodLo) + ' x="0" y="' + RAIL + '" width="440" height="9" rx="1.5"/>';
  s += '<rect' + F(C.woodHi, ' opacity=".8"') + ' x="0" y="' + RAIL + '" width="440" height="2.2" rx="1.1"/>';
  s += '<rect' + F(C.shadow, ' opacity=".35"') + ' x="0" y="' + (RAIL + 9) + '" width="440" height="4"/>';

  /* ── กำแพงนาฬิกาฝั่งขวา: แขวนจากรางเป็นกลุ่ม ── */
  const HUNG = [[262,264,18,314,150,false],[324,236,24,82,340,true],[392,262,15,190,40,false],
                [272,190,13,20,240,true],[348,168,17,150,66,false],[416,196,12,260,96,false]];
  s += "<g>";
  HUNG.forEach(d => {
    const drop = d[1] - d[2] - 2 - (RAIL + 6);
    if (drop < 10) return;                       /* แขวนชิดรางจนไม่มีเชือก = ไม่ต้องมีตะขอ */
    s += '<path' + S(C.chain, 1.2, ' opacity=".85"') + ' d="M ' + d[0] + " " + (RAIL + 6) + " L " + d[0] + " " + N2(d[1] - d[2] - 2) + '"/>';
    s += '<circle' + S(C.brass, 1.7) + ' cx="' + d[0] + '" cy="' + (RAIL + 5) + '" r="2.6"/>';
    s += '<circle' + F(C.brassHi, ' opacity=".8"') + ' cx="' + (d[0] - 0.9) + '" cy="' + (RAIL + 4.1) + '" r="0.9"/>';
  });
  HUNG.forEach(d => { s += wallDial(d[0], d[1], d[2], d[3], d[4], d[5]); });
  s += "</g>";

  /* ── ชั้นวางฝั่งขวา (y=336 = ระดับเดียวกับกลางหน้าปัดใหญ่ ให้ภาพมีเส้นยึด) ──
     ของบนชั้นต้องเป็นของที่ "เรียกชื่อได้" ทุกชิ้น */
  const sy = SHELF.y;
  s += '<g id="ckShelf">';
  /* กระบอกใส่เครื่องมือ: ทรงกระบอก + ด้ามยื่นออกคนละองศา (ตัวชี้ขาดว่าไม่ใช่แก้วน้ำ) */
  s += '<g>';
  s += '<path' + S(C.steelHi, 1.6, ' opacity=".75" stroke-linecap="round"') + ' d="M 252 ' + (sy - 22) + ' L 246 ' + (sy - 44) + '"/>';
  s += '<path' + S(C.brass, 2, ' stroke-linecap="round"') + ' d="M 257 ' + (sy - 22) + ' L 263 ' + (sy - 46) + '"/>';
  s += '<path' + S(C.steelHi, 1.3, ' opacity=".7" stroke-linecap="round"') + ' d="M 261 ' + (sy - 22) + ' L 272 ' + (sy - 38) + '"/>';
  s += '<circle' + F(C.brassHi) + ' cx="263.6" cy="' + (sy - 47) + '" r="2"/>';
  s += '<path' + F(C.woodLo) + ' d="M 244 ' + (sy - 26) + ' L 270 ' + (sy - 26) + ' L 267 ' + (sy - 1) + ' L 247 ' + (sy - 1) + ' Z"/>';
  s += '<path' + F(C.woodHi, ' opacity=".55"') + ' d="M 246 ' + (sy - 26) + ' L 252 ' + (sy - 26) + ' L 250.5 ' + (sy - 1) + ' L 247 ' + (sy - 1) + ' Z"/>';
  s += '<ellipse' + F(C.inner) + ' cx="257" cy="' + (sy - 26) + '" rx="13" ry="3.4"/>';
  s += "</g>";
  /* นาฬิกาตั้งโต๊ะทรงกล่อง: กล่อง + หน้าปัด + หูหิ้ว + ขา 4 ขา */
  s += "<g>";
  s += '<path' + S(C.brass, 2, ' stroke-linecap="round"') + ' d="M 306 ' + (sy - 40) + ' q 15 -13 30 0"/>';
  s += '<rect' + F("url(#ckWoodG)") + ' x="303" y="' + (sy - 40) + '" width="36" height="35" rx="3"/>';
  s += '<rect' + F(C.woodHi, ' opacity=".5"') + ' x="303" y="' + (sy - 40) + '" width="36" height="2.4" rx="1"/>';
  s += '<circle' + F(C.brass) + ' cx="321" cy="' + (sy - 23) + '" r="12"/>';
  s += '<circle' + F(C.ivory) + ' cx="321" cy="' + (sy - 23) + '" r="9.6"/>';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    s += '<path' + S(C.steel, i % 3 ? 0.7 : 1.2) + ' d="M ' + P(321, sy - 23, 8.4, a).join(" ") + " L " + P(321, sy - 23, i % 3 ? 6.9 : 6.2, a).join(" ") + '"/>';
  }
  s += hand(321, sy - 23, 4.6, 130, 1, { halo: false });
  s += hand(321, sy - 23, 7, 292, 0.8, { halo: false });
  s += '<circle' + F(C.brassLo) + ' cx="321" cy="' + (sy - 23) + '" r="1.2"/>';
  s += '<rect' + F(C.brassLo) + ' x="305" y="' + (sy - 6) + '" width="4" height="5" rx="1"/>';
  s += '<rect' + F(C.brassLo) + ' x="333" y="' + (sy - 6) + '" width="4" height="5" rx="1"/>';
  s += "</g>";
  /* นาฬิกาทราย: กรอบไม้บน-ล่าง + เสา 3 ต้น + แก้วคอดกลาง + ทรายกองล่างและสายไหลบาง ๆ */
  s += "<g>";
  s += '<ellipse' + F(C.shadow, ' opacity=".4"') + ' cx="392" cy="' + (sy - 2) + '" rx="21" ry="4.5"/>';
  s += '<rect' + F("url(#ckWoodG)") + ' x="371" y="' + (sy - 5) + '" width="42" height="6" rx="2"/>';
  s += '<rect' + F("url(#ckWoodG)") + ' x="371" y="' + (sy - 62) + '" width="42" height="6" rx="2"/>';
  s += '<rect' + F(C.woodHi, ' opacity=".6"') + ' x="371" y="' + (sy - 62) + '" width="42" height="1.8" rx="0.9"/>';
  [374.5, 391, 407.5].forEach(px =>
    s += '<rect' + F(C.woodLo) + ' x="' + (px - 1.6) + '" y="' + (sy - 57) + '" width="3.2" height="52" rx="1.4"/>');
  /* ตัวแก้ว: กรวยคว่ำ + กรวยหงาย จรดกันที่คอ */
  s += '<path' + F(C.glass, ' opacity=".16"') + ' d="M 375 ' + (sy - 56) + ' L 409 ' + (sy - 56) + ' L 394.6 ' + (sy - 33.5) +
    ' L 394.6 ' + (sy - 29.5) + ' L 409 ' + (sy - 7) + ' L 375 ' + (sy - 7) + ' L 389.4 ' + (sy - 29.5) +
    ' L 389.4 ' + (sy - 33.5) + ' Z"/>';
  /* ทรายบน (เหลือน้อย) + ทรายล่าง (กองแล้ว) + สายทรายที่กำลังไหล */
  s += '<path' + F(C.brass) + ' d="M 378 ' + (sy - 53) + ' L 406 ' + (sy - 53) + ' L 393.4 ' + (sy - 34) + ' L 390.6 ' + (sy - 34) + ' Z"/>';
  s += '<path' + S(C.brassHi, 1, ' opacity=".9"') + ' d="M 392 ' + (sy - 33) + ' L 392 ' + (sy - 17) + '"/>';
  s += '<path' + F(C.brass) + ' d="M 379 ' + (sy - 8) + ' q 13 -13 26 0 Z"/>';
  s += '<path' + F(C.brassHi, ' opacity=".55"') + ' d="M 383 ' + (sy - 9.6) + ' q 9 -7 18 0 Z"/>';
  s += '<path' + S(C.glass, 1.1, ' opacity=".3"') + ' d="M 379.5 ' + (sy - 54) + ' L 391 ' + (sy - 33) + '"/>';
  s += "</g>";
  /* ตัวชั้นวาง: วาดหลังของบนชั้น เพื่อให้ของ "วางอยู่บน" ไม่ใช่ "ลอยหน้า" */
  s += '<rect' + F(C.woodLo) + ' x="' + SHELF.x1 + '" y="' + sy + '" width="' + (SHELF.x2 - SHELF.x1) + '" height="9" rx="1.5"/>';
  s += '<rect' + F(C.woodHi) + ' x="' + SHELF.x1 + '" y="' + sy + '" width="' + (SHELF.x2 - SHELF.x1) + '" height="2.6" rx="1.3"/>';
  s += '<path' + F(C.woodLo) + ' d="M 246 ' + (sy + 9) + ' l 9 0 l -3 13 l -3 0 Z"/>';
  s += '<path' + F(C.woodLo) + ' d="M 372 ' + (sy + 9) + ' l 9 0 l -3 13 l -3 0 Z"/>';
  s += '<ellipse' + F(C.shadow, ' opacity=".3"') + ' cx="333" cy="' + (sy + 13) + '" rx="106" ry="7"/>';


  s += "</g>";


  /* ── พื้นไม้: แผ่นวิ่งเข้าหาจุดรวมสายตาที่ (200,612) = อ่านเป็นพื้นทันที ── */
  const VPX = 200, VPY = GROUND;
  s += '<rect' + F(C.floor) + ' x="0" y="' + GROUND + '" width="440" height="' + (H - GROUND) + '"/>';
  s += "<g>";
  for (let i = -13; i <= 13; i++) {
    const xb = VPX + i * 66;                      /* ขอบแผ่นที่ขอบล่างของภาพ */
    s += '<path' + S(C.floorLine, 1.2, ' opacity=".7"') + ' d="M ' + VPX + " " + VPY + " L " + N2(xb) + " " + H + '"/>';
    s += '<path' + S(C.floorHi, 0.8, ' opacity=".26"') + ' d="M ' + VPX + " " + VPY + " L " + N2(xb + 2.4) + " " + H + '"/>';
  }
  /* รอยต่อหัวแผ่น: ถี่ตรงขอบฟ้า ห่างขึ้นเมื่อเข้าใกล้ผู้ดู */
  [618, 630, 649, 678, 722, 790].forEach(yy => {
    s += '<path' + S(C.floorLine, 1.2, ' opacity=".55"') + ' d="M 0 ' + yy + " L 440 " + yy + '"/>';
  });
  s += "</g>";
  s += '<rect' + F("url(#ckFloorFade)") + ' x="0" y="' + GROUND + '" width="440" height="' + (H - GROUND) + '"/>';

  /* ═══ ตัวเรือนนาฬิกา ═══ */
  s += '<g id="ckCase">';
  s += '<ellipse' + F(C.shadow, ' opacity=".34"') + ' cx="' + (CX + 4) + '" cy="' + (GROUND + 9) + '" rx="138" ry="13"/>';
  s += '<ellipse' + F(C.shadow, ' opacity=".3"') + ' cx="' + (CX + 2) + '" cy="' + (GROUND + 5) + '" rx="104" ry="7"/>';
  /* ฐาน: มีบัวหัวเสา + ตัวฐาน + บัวเชิง */
  s += '<rect' + F(C.woodLo) + ' x="' + (g.plinthX1 - 2) + '" y="' + g.plinthTop + '" width="' + (g.plinthX2 - g.plinthX1 + 4) + '" height="11" rx="2"/>';
  s += '<rect' + F(C.woodHi) + ' x="' + (g.plinthX1 - 2) + '" y="' + g.plinthTop + '" width="' + (g.plinthX2 - g.plinthX1 + 4) + '" height="2.8" rx="1.4"/>';
  s += '<rect' + F("url(#ckWoodG)") + ' x="' + (g.plinthX1 + 6) + '" y="' + (g.plinthTop + 11) + '" width="' + (g.plinthX2 - g.plinthX1 - 12) + '" height="' + (g.plinthBot - g.plinthTop - 19) + '"/>';
  s += '<rect' + S(C.woodLo, 2.4) + ' x="' + (g.plinthX1 + 20) + '" y="' + (g.plinthTop + 20) + '" width="' + (g.plinthX2 - g.plinthX1 - 40) + '" height="' + (g.plinthBot - g.plinthTop - 36) + '" rx="2"/>';
  s += '<rect' + F(C.woodLo) + ' x="' + (g.plinthX1 - 4) + '" y="' + (g.plinthBot - 8) + '" width="' + (g.plinthX2 - g.plinthX1 + 8) + '" height="8" rx="2"/>';
  /* ลำตัว */
  s += '<rect' + F("url(#ckWoodG)") + ' x="' + g.trunkX1 + '" y="' + g.trunkTop + '" width="' + (g.trunkX2 - g.trunkX1) + '" height="' + (g.trunkBot - g.trunkTop) + '"/>';
  s += '<rect' + F(C.woodHi) + ' x="' + (g.trunkX2 - 5) + '" y="' + g.trunkTop + '" width="5" height="' + (g.trunkBot - g.trunkTop) + '"/>';
  s += '<rect' + F(C.woodLo) + ' x="' + g.trunkX1 + '" y="' + g.trunkTop + '" width="6" height="' + (g.trunkBot - g.trunkTop) + '"/>';
  /* ช่องกระจกลำตัว */
  s += '<rect' + F(C.inner) + ' x="' + gx1 + '" y="' + (g.trunkTop + 10) + '" width="' + (gx2 - gx1) + '" height="' + (g.trunkBot - g.trunkTop - 22) + '" rx="4"/>';
  s += '<g clip-path="url(#ckTrunkClip)">';
  for (let bx = gx1 + 4; bx < gx2; bx += 17) {
    s += '<path' + S(C.woodLo, 1.4, ' opacity=".85"') + ' d="M ' + N2(bx) + " " + (g.trunkTop + 10) + " L " + N2(bx) + " " + (g.trunkBot - 12) + '"/>';
    s += '<path' + S(C.woodHi, 0.8, ' opacity=".22"') + ' d="M ' + N2(bx + 1.6) + " " + (g.trunkTop + 10) + " L " + N2(bx + 1.6) + " " + (g.trunkBot - 12) + '"/>';
  }
  s += '<ellipse' + F("url(#ckPoolInnerG)", ' opacity=".85"') + ' cx="' + CX + '" cy="' + (g.trunkTop + 62) + '" rx="92" ry="86"/>';
  /* ตุ้มน้ำหนัก: โซ่ + กระบอก + หัวจุกบน-ล่าง (หัวจุกคือตัวแยกจากกระป๋อง) */
  const wTop = g.trunkTop + 30;
  s += '<path' + S(C.chain, 1.8) + ' d="M 45 ' + (g.trunkTop + 10) + ' L 45 ' + (wTop - 3) + '"/>';
  s += '<circle' + F(C.brassLo) + ' cx="45" cy="' + (wTop - 3) + '" r="4"/>';
  s += '<rect' + F("url(#ckBrassG)") + ' x="36.5" y="' + wTop + '" width="17" height="54" rx="3"/>';
  s += '<rect' + F(C.brassHi, ' opacity=".5"') + ' x="38" y="' + (wTop + 2) + '" width="3.6" height="50" rx="1.8"/>';
  s += '<rect' + F(C.brassLo) + ' x="35.5" y="' + (wTop - 1) + '" width="19" height="5" rx="2"/>';
  s += '<rect' + F(C.brassLo) + ' x="35.5" y="' + (wTop + 49) + '" width="19" height="6" rx="2.6"/>';
  /* ลูกตุ้ม: ตัวชี้ขาดของธีม อยู่ในโซนที่เห็นเสมอทุกจอ */
  s += '<g transform="translate(' + CX + " " + PEND.pivotY + ')"><g class="ckPend"><g transform="translate(' + (-CX) + " " + (-PEND.pivotY) + ')">';
  s += '<path' + S(C.brassLo, 2.8) + ' d="M ' + CX + " " + (g.trunkTop + 12) + " L " + CX + " " + (PEND.bobY - PEND.bobR + 5) + '"/>';
  s += '<path' + S(C.brassHi, 1, ' opacity=".75"') + ' d="M ' + (CX - 1.1) + " " + (g.trunkTop + 12) + " L " + (CX - 1.1) + " " + (PEND.bobY - PEND.bobR + 5) + '"/>';
  s += '<circle' + F("url(#ckBrassG)") + ' cx="' + CX + '" cy="' + PEND.bobY + '" r="' + PEND.bobR + '"/>';
  s += '<circle' + S(C.brassLo, 2) + ' cx="' + CX + '" cy="' + PEND.bobY + '" r="' + (PEND.bobR - 5.5) + '"/>';
  s += '<circle' + F(C.brassHi, ' opacity=".85"') + ' cx="' + (CX - 7) + '" cy="' + (PEND.bobY - 7) + '" r="5.6"/>';
  s += '<path' + F(C.brassLo) + ' d="M ' + (CX - 2.6) + " " + (PEND.bobY + PEND.bobR - 1) + " L " + (CX + 2.6) + " " + (PEND.bobY + PEND.bobR - 1) +
    " L " + (CX + 1.7) + " " + (PEND.bobY + PEND.bobR + 8) + " L " + (CX - 1.7) + " " + (PEND.bobY + PEND.bobR + 8) + ' Z"/>';
  s += "</g></g></g>";
  s += "</g>";
  /* กระจก: แถบสะท้อนบาง 2 เส้น (รอบแรกทำเป็นแผ่นกว้าง -> อ่านเป็นรอยขีด) */
  s += '<path' + F(C.glass, ' opacity=".075"') + ' d="M ' + (gx1 + 46) + " " + (g.trunkBot - 14) + " L " + (gx1 + 10) + " " + (g.trunkTop + 12) +
    " L " + (gx1 + 21) + " " + (g.trunkTop + 12) + " L " + (gx1 + 57) + " " + (g.trunkBot - 14) + ' Z"/>';
  s += '<path' + F(C.glass, ' opacity=".05"') + ' d="M ' + (gx1 + 64) + " " + (g.trunkBot - 14) + " L " + (gx1 + 28) + " " + (g.trunkTop + 12) +
    " L " + (gx1 + 33) + " " + (g.trunkTop + 12) + " L " + (gx1 + 69) + " " + (g.trunkBot - 14) + ' Z"/>';
  s += '<rect' + S(C.woodLo, 2.6) + ' x="' + gx1 + '" y="' + (g.trunkTop + 10) + '" width="' + (gx2 - gx1) + '" height="' + (g.trunkBot - g.trunkTop - 22) + '" rx="4"/>';
  s += '<rect' + F(C.brass) + ' x="' + (gx1 - 5) + '" y="' + (g.trunkTop + 32) + '" width="5" height="13" rx="1.6"/>';
  s += '<rect' + F(C.brass) + ' x="' + (gx1 - 5) + '" y="' + (g.trunkBot - 58) + '" width="5" height="13" rx="1.6"/>';
  s += '<circle' + F(C.brassHi) + ' cx="' + (gx2 + 4) + '" cy="' + (g.trunkTop + 80) + '" r="3.4"/>';

  /* หัวเรือน */
  s += '<rect' + F("url(#ckWoodG)") + ' x="' + g.hoodX1 + '" y="' + g.hoodTop + '" width="' + (g.hoodX2 - g.hoodX1) + '" height="' + (g.hoodBot - g.hoodTop) + '" rx="3"/>';
  s += '<rect' + F(C.woodHi) + ' x="' + (g.hoodX2 - 6) + '" y="' + g.hoodTop + '" width="6" height="' + (g.hoodBot - g.hoodTop) + '"/>';
  s += '<rect' + F(C.woodLo) + ' x="' + g.hoodX1 + '" y="' + g.hoodTop + '" width="7" height="' + (g.hoodBot - g.hoodTop) + '"/>';
  s += '<rect' + F(C.woodLo) + ' x="' + (g.hoodX1 - 3) + '" y="' + (g.hoodBot - 14) + '" width="' + (g.hoodX2 - g.hoodX1 + 6) + '" height="14" rx="2"/>';
  s += '<rect' + F(C.woodHi) + ' x="' + (g.hoodX1 - 3) + '" y="' + (g.hoodBot - 14) + '" width="' + (g.hoodX2 - g.hoodX1 + 6) + '" height="2.6"/>';
  /* ห้องเครื่อง: แผ่นรองสีเข้มเรียบ ให้ล้อทองเหลืองมีที่ยืน (รอบแรกวางบนไม้ -> น้ำตาลบนน้ำตาล อ่านไม่ออก) */
  s += '<rect' + F(C.inner) + ' x="' + HOODIN.x + '" y="' + HOODIN.y + '" width="' + HOODIN.w + '" height="' + HOODIN.h + '" rx="4"/>';
  s += '<g clip-path="url(#ckHoodClip)">';
  s += '<ellipse' + F("url(#ckPoolInnerG)") + ' cx="' + DIAL.x + '" cy="' + DIAL.y + '" rx="124" ry="108"/>';
  s += '<rect' + F(C.plate, ' opacity=".94"') + ' x="' + (HOODIN.x + 6) + '" y="' + (HOODIN.y + 6) + '" width="' + (HOODIN.w - 12) + '" height="' + (HOODIN.h - 12) + '" rx="3"/>';
  s += '<rect' + F(C.plateHi, ' opacity=".5"') + ' x="' + (HOODIN.x + 6) + '" y="' + (HOODIN.y + 6) + '" width="' + (HOODIN.w - 12) + '" height="2.4" rx="1.2"/>';
  [[HOODIN.x + 14, HOODIN.y + 14], [HOODIN.x + HOODIN.w - 14, HOODIN.y + 14],
   [HOODIN.x + 14, HOODIN.y + HOODIN.h - 14], [HOODIN.x + HOODIN.w - 14, HOODIN.y + HOODIN.h - 14]].forEach(p =>
    s += '<circle' + F(C.brassLo) + ' cx="' + p[0] + '" cy="' + p[1] + '" r="3.4"/>' +
      '<circle' + F(C.brassHi, ' opacity=".7"') + ' cx="' + (p[0] - 0.8) + '" cy="' + (p[1] - 0.8) + '" r="1.5"/>');
  s += train.map((t, i) => gearSVG(t, "ckGear" + i)).join("");
  s += train.map(t => '<circle' + F(C.steelHi, ' opacity=".85"') + ' cx="' + t.cx + '" cy="' + t.cy + '" r="1.7"/>').join("");
  s += "</g>";
  /* หน้าปัด */
  s += '<rect' + S(C.woodHi, 1.6, ' opacity=".55"') + ' x="' + (HOODIN.x + 3) + '" y="' + (HOODIN.y + 3) + '" width="' + (HOODIN.w - 6) + '" height="' + (HOODIN.h - 6) + '" rx="3"/>';
  const gTop = HOODIN.y + 6, gBot = HOODIN.y + HOODIN.h - 6;
  s += '<path' + F(C.glass, ' opacity=".05"') + ' d="M 34 ' + gBot + ' L 96 ' + gTop + ' L 116 ' + gTop + ' L 54 ' + gBot + ' Z"/>';
  s += '<path' + F(C.glass, ' opacity=".035"') + ' d="M 66 ' + gBot + ' L 128 ' + gTop + ' L 137 ' + gTop + ' L 75 ' + gBot + ' Z"/>';
  s += chapterRing();
  const SUB = { x: CX, y: DIAL.y + 24, r: 12.5 };
  s += '<circle' + F(C.brass) + ' cx="' + SUB.x + '" cy="' + SUB.y + '" r="' + (SUB.r + 1.4) + '"/>';
  s += '<circle' + F(C.ivory) + ' cx="' + SUB.x + '" cy="' + SUB.y + '" r="' + SUB.r + '"/>';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    s += '<path' + S(C.steel, i % 3 ? 0.8 : 1.4) + ' d="M ' + P(SUB.x, SUB.y, SUB.r - 2, a).join(" ") + " L " + P(SUB.x, SUB.y, SUB.r - (i % 3 ? 3.6 : 4.8), a).join(" ") + '"/>';
  }
  s += '<g transform="translate(' + SUB.x + " " + SUB.y + ')"><g class="ckSec"><g transform="translate(' + (-SUB.x) + " " + (-SUB.y) + ')">';
  s += '<path' + S(C.steel, 1.4, ' stroke-linecap="round"') + ' d="M ' + SUB.x + " " + (SUB.y + 3.2) + " L " + SUB.x + " " + (SUB.y - SUB.r + 2.6) + '"/>';
  s += "</g></g></g>";
  s += '<circle' + F(C.brassLo) + ' cx="' + SUB.x + '" cy="' + SUB.y + '" r="1.5"/>';
  s += hand(DIAL.x, DIAL.y, 27, hourDeg, 4, { lume: true });
  s += hand(DIAL.x, DIAL.y, 49, minDeg, 2.6, { lume: true });
  s += '<circle' + F(C.brassHi) + ' cx="' + DIAL.x + '" cy="' + DIAL.y + '" r="4.4"/>';
  s += '<circle' + F(C.steel) + ' cx="' + DIAL.x + '" cy="' + DIAL.y + '" r="1.9"/>';

  /* หน้าจั่วหักโค้ง + ยอดทองเหลือง */
  const arch = (dy) => "M " + g.hoodX1 + " " + (g.pedBot - 14 + dy) +
    " C 30 " + (g.pedBot - 18 + dy) + " 52 " + (g.pedTop + 4 + dy) + " " + (CX - 13) + " " + (g.pedTop + 2 + dy) +
    " L " + (CX + 13) + " " + (g.pedTop + 2 + dy) +
    " C " + (g.hoodX2 - 46) + " " + (g.pedTop + 4 + dy) + " " + (g.hoodX2 - 24) + " " + (g.pedBot - 18 + dy) + " " + g.hoodX2 + " " + (g.pedBot - 14 + dy);
  s += '<path' + F("url(#ckWoodG)") + ' d="' + arch(0) + " L " + g.hoodX2 + " " + g.pedBot + " L " + g.hoodX1 + " " + g.pedBot + ' Z"/>';
  s += '<path' + S(C.woodHi, 2.8) + ' d="' + arch(0) + '"/>';
  s += '<rect' + F(C.woodLo) + ' x="' + (g.hoodX1 - 3) + '" y="' + (g.pedBot - 8) + '" width="' + (g.hoodX2 - g.hoodX1 + 6) + '" height="10" rx="2"/>';
  s += '<rect' + F(C.woodHi, ' opacity=".85"') + ' x="' + (g.hoodX1 - 3) + '" y="' + (g.pedBot - 8) + '" width="' + (g.hoodX2 - g.hoodX1 + 6) + '" height="2.2"/>';
  const finial = (fx, fy, sc) => '<g transform="translate(' + fx + " " + fy + ") scale(" + sc + ')">' +
    '<path' + F(C.brassLo) + ' d="M -7 0 L 7 0 L 4.6 -5 L -4.6 -5 Z"/>' +
    '<path' + F(C.brass) + ' d="M -4.6 -5 L 4.6 -5 L 3 -9 L -3 -9 Z"/>' +
    '<circle' + F("url(#ckBrassG)") + ' cx="0" cy="-14" r="6.2"/>' +
    '<circle' + F(C.brassHi, ' opacity=".9"') + ' cx="-2" cy="-15.8" r="2.4"/>' +
    '<path' + F(C.brass) + ' d="M -1.8 -19.4 L 1.8 -19.4 L 1 -29 L -1 -29 Z"/>' +
    '<circle' + F(C.brassHi) + ' cx="0" cy="-30" r="1.7"/>' +
    "</g>";
  s += finial(CX, g.pedTop + 2, 1.35);
  s += finial(g.hoodX1 + 19, g.pedBot - 6, 0.86);
  s += finial(g.hoodX2 - 19, g.pedBot - 6, 0.86);
  s += "</g>";

  /* ── ของบนพื้น: เฟืองที่ถอดออกมาวาง + ขี้กบ = ห้องนี้ยังทำงานอยู่จริง ── */
  s += "<g>";
  s += '<ellipse' + F(C.shadow, ' opacity=".5"') + ' cx="172" cy="651" rx="27" ry="6.5"/>';
  s += '<g transform="translate(168 646) scale(1 0.38)">' + gearSVG({ cx: 0, cy: 0, N: 13, phase: 7 }, "") + "</g>";
  const shav = (x, y, sc) => '<path' + F(C.floorHi, ' opacity=".8"') + ' transform="translate(' + x + " " + y + ") scale(" + sc + ')" d="M 0 0 c 11 -7 26 -6 33 2 c -10 -4 -22 -3 -33 3 Z"/>';
  s += shav(206, 662, 1) + shav(118, 692, 1.25) + shav(26, 658, 0.85) + shav(390, 644, 0.9) + shav(300, 706, 1.1);
  s += "</g>";
  return { body: s, train };
}

/* ═════════ defs + ประกอบไฟล์ ═════════ */
const { body, train } = build();
const defs = "<defs>\n" +
  '<filter id="ckSoft" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="26"/></filter>\n' +
  '<linearGradient id="ckWallG" x1="0" y1="0" x2=".12" y2="1">' +
  '<stop offset="0" stop-color="var(--hs-wall-1,#191320)"/>' +
  '<stop offset=".45" stop-color="var(--hs-wall-2,#241C2C)"/>' +
  '<stop offset="1" stop-color="var(--hs-wall-3,#2E2434)"/></linearGradient>\n' +
  '<radialGradient id="ckPoolG" cx=".5" cy=".5" r=".5">' +
  '<stop offset="0" stop-color="var(--hs-glow,#FFAF5E)" stop-opacity=".30"/>' +
  '<stop offset=".5" stop-color="var(--hs-glow,#FFAF5E)" stop-opacity=".12"/>' +
  '<stop offset="1" stop-color="var(--hs-glow,#FFAF5E)" stop-opacity="0"/></radialGradient>\n' +
  '<radialGradient id="ckPoolG2" cx=".5" cy=".5" r=".5">' +
  '<stop offset="0" stop-color="var(--hs-glow2,#FFD59A)" stop-opacity=".44"/>' +
  '<stop offset="1" stop-color="var(--hs-glow2,#FFD59A)" stop-opacity="0"/></radialGradient>\n' +
  '<radialGradient id="ckPoolInnerG" cx=".5" cy=".45" r=".5">' +
  '<stop offset="0" stop-color="var(--hs-inner-glow,#D08F45)" stop-opacity=".62"/>' +
  '<stop offset="1" stop-color="var(--hs-inner-glow,#D08F45)" stop-opacity="0"/></radialGradient>\n' +
  '<radialGradient id="ckFloorFade" cx=".34" cy="0" r=".92">' +
  '<stop offset="0" stop-color="#000" stop-opacity="0"/>' +
  '<stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>\n' +
  '<linearGradient id="ckRingG" x1="0" y1="0" x2=".22" y2="1">' +
  '<stop offset="0" stop-color="var(--hs-ring-1,#FFF6DE)"/>' +
  '<stop offset=".5" stop-color="var(--hs-ring-2,#EFDCB4)"/>' +
  '<stop offset="1" stop-color="var(--hs-ring-3,#CBAD80)"/></linearGradient>\n' +
  '<linearGradient id="ckBrassG" x1="0" y1="0" x2=".3" y2="1">' +
  '<stop offset="0" stop-color="var(--hs-brass-hi,#F5D794)"/>' +
  '<stop offset=".5" stop-color="var(--hs-brass,#C1904A)"/>' +
  '<stop offset="1" stop-color="var(--hs-brass-lo,#7A5623)"/></linearGradient>\n' +
  '<linearGradient id="ckWoodG" x1="0" y1="0" x2=".16" y2="1">' +
  '<stop offset="0" stop-color="var(--hs-wood-hi,#6B4632)"/>' +
  '<stop offset=".5" stop-color="var(--hs-wood,#4A2F22)"/>' +
  '<stop offset="1" stop-color="var(--hs-wood-lo,#2A1811)"/></linearGradient>\n' +
  '<clipPath id="ckHoodClip"><rect x="' + HOODIN.x + '" y="' + HOODIN.y + '" width="' + HOODIN.w + '" height="' + HOODIN.h + '" rx="4"/></clipPath>\n' +
  '<clipPath id="ckTrunkClip"><rect x="' + (CASE.trunkX1 + CASE.glassPad) + '" y="' + (CASE.trunkTop + 10) +
  '" width="' + (CASE.trunkX2 - CASE.trunkX1 - CASE.glassPad * 2) + '" height="' + (CASE.trunkBot - CASE.trunkTop - 22) + '" rx="4"/></clipPath>\n' +
  "</defs>";

const head = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Clockmaker\'s room at night">\n' +
  '<!-- ฉากหน้า Home ชุด "ห้องช่างนาฬิกา" - สร้างจาก www/skins/_gen-home-clock.js ห้ามแก้ไฟล์นี้ด้วยมือ\n' +
  "     เส้นพื้น y=612 . มาสคอตกิน x 200-435 ที่ y 385-690 . โซนเห็นเสมอ x 0-198 ที่ y 320-612\n" +
  "     กฎกลาง: แสงมาจากของที่นับเวลาเท่านั้น ตัวเรือนนาฬิกาคือโคมดวงเดียวของห้อง\n" +
  "     สีเรืองมิ้นต์ใช้ได้เฉพาะบนหน้าปัดสีเข้ม . ห้ามใช้เขียวสดเพราะจะกลืนกับปุ่ม CTA ของแอป -->";

const svg = head + "\n" + defs + "\n" + body + "\n</svg>\n";
fs.writeFileSync(OUT, svg, "utf8");
console.log("เขียน " + OUT + "  (" + (svg.length / 1024).toFixed(1) + " KB)");
console.log("ขบวนเฟือง (ต้องอยู่ในห้องเครื่อง x " + HOODIN.x + "-" + (HOODIN.x+HOODIN.w) + " y " + HOODIN.y + "-" + (HOODIN.y+HOODIN.h) + "):");
train.forEach((t, i) => console.log("  #" + i + " N=" + t.N + " R=" + N2(t.R) + " ที่ (" + t.cx + "," + t.cy + ") เฟส " + t.phase +
  " " + (t.dir > 0 ? "ตามเข็ม" : "ทวนเข็ม") + " | กรอบ x " + N2(t.cx - t.R - MODULE) + "-" + N2(t.cx + t.R + MODULE) +
  " y " + N2(t.cy - t.R - MODULE) + "-" + N2(t.cy + t.R + MODULE)));
