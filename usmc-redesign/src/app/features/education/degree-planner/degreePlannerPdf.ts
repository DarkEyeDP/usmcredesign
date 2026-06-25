import type { DegreeLevel, FundingSource, SchoolDetails, Term } from './types';
import { TA_ANNUAL_MAX, FUNDING_META, COURSE_STATUS_META } from './constants';
import { fiscalYear } from './utils';

// ── Page geometry ────────────────────────────────────────────────────────────────
const PAGE_W    = 215.9;
const PAGE_H    = 279.4;
const MAR_L     = 19;
const MAR_R     = 19;
const CONTENT_W = PAGE_W - MAR_L - MAR_R;   // 177.9 mm

const HEADER_H   = 38;                        // page 1 branded header height
const THIN_H     = 14;                        // subsequent page thin header height
const FOOTER_H   = 14;                        // footer band height
const MAR_T_P1   = HEADER_H + 8;             // content start y on page 1
const MAR_T_REST = THIN_H + 6;               // content start y on page 2+
const MAR_B      = FOOTER_H + 8;             // content bottom limit (before footer)

// Course table column x-offsets from MAR_L
const COL = { name: 2, cr: 88, cost: 99, funding: 114, status: 138, grade: 165 } as const;

// ── Color palette ────────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const C: Record<string, RGB> = {
  red:     [180,   0,   0],
  nearBlk: [  8,   8,  12],
  bgDark:  [ 32,  32,  38],
  text:    [ 25,  25,  30],
  mid:     [ 80,  80,  85],
  muted:   [115, 115, 120],
  light:   [165, 165, 170],
  pale:    [210, 210, 215],
  bg:      [252, 252, 253],
  bgAlt:   [245, 245, 247],
  green:   [  0, 110,  55],
  amber:   [150,  80,   0],
  white:   [255, 255, 255],
};

// ── Logo rendering ───────────────────────────────────────────────────────────────
const SPEAR_VB_W = 729.73;
const SPEAR_VB_H = 1191.89;
const SPEAR_PATH = [
  'M604.06 653.85 554.33 664.53 607.91 622.17 507.18 436.07 442.33 478',
  'l49.55-93.43-122.93-252.22-122.93 252.22 69.04-53.21-84.34 104.71',
  '-100.73 186.1 69.63-76.47-54.82 108.15 41.48-11.75-78.52 60.64',
  '-58.52 146.99 132.11 163.08 22.07-141.25 2.21 141.25 163.32 139.04',
  '163.32-139.04 2.21-141.25 22.07 141.25 123.97-153.03-76.44-205.93Z',
  'M369.47 778.63l-31.15 48.24 31.15-16.08v253.24l-126.62-97.48-1.01-203',
  '-88.43 145.72-59.29-64.32 53.26-117.58 108.53-109.54-55.27 18.09',
  '72.35-152.75-45.22 39.19 132.71-262.61-49.3 300.79',
  's58.29-68.34 58.29-63.31v281.38Z',
].join('');

async function renderLogo(heightMm: number): Promise<{ data: string; w: number; h: number }> {
  const ratio = SPEAR_VB_W / SPEAR_VB_H;
  const scale = 4 * 3.7795;            // 4× resolution (≈ 384 DPI)
  const hPx   = Math.round(heightMm * scale);
  const wPx   = Math.round(hPx * ratio);

  return new Promise(resolve => {
    // Gold-to-red gradient matching the SiteLogo 'gold' variant
    const svg  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPEAR_VB_W} ${SPEAR_VB_H}" width="${wPx}" height="${hPx}">
      <defs>
        <linearGradient id="lg" x1="364.865" y1="0" x2="364.865" y2="1191.89" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stop-color="rgba(255,244,214,1)"/>
          <stop offset="42%"  stop-color="rgba(212,173,93,1)"/>
          <stop offset="100%" stop-color="rgba(163,29,45,1)"/>
        </linearGradient>
      </defs>
      <path d="${SPEAR_PATH}" fill="url(#lg)"/>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = wPx; canvas.height = hPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); resolve({ data: '', w: 0, h: 0 }); return; }
      // Fill with the header background color to eliminate PNG transparency artifacts in jsPDF
      ctx.fillStyle = '#08080c';
      ctx.fillRect(0, 0, wPx, hPx);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve({ data: canvas.toDataURL('image/png'), w: heightMm * ratio, h: heightMm });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ data: '', w: 0, h: 0 }); };
    img.src = url;
  });
}

// ── jsPDF type shorthand ─────────────────────────────────────────────────────────
type Doc = InstanceType<typeof import('jspdf').jsPDF>;

function lh(size: number, factor = 1.45) { return size * 0.352778 * factor; }

// ── Page-level bands ─────────────────────────────────────────────────────────────
function drawHeader(doc: Doc, logo: { data: string; w: number; h: number }, today: string) {
  // Dark band
  doc.setFillColor(...C.nearBlk);
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
  // Red bottom bar
  doc.setFillColor(...C.red);
  doc.rect(0, HEADER_H - 2.5, PAGE_W, 2.5, 'F');

  // Subtle internal grid
  doc.setDrawColor(25, 25, 32);
  doc.setLineWidth(0.15);
  for (let x = 0; x <= PAGE_W; x += 18) doc.line(x, 0, x, HEADER_H - 2.5);
  for (let y = 0; y <= HEADER_H - 2.5; y += 9)  doc.line(0, y, PAGE_W, y);

  // Logo
  const logoY = (HEADER_H - 2.5 - logo.h) / 2;
  if (logo.data) doc.addImage(logo.data, 'PNG', MAR_L, logoY, logo.w, logo.h);

  const textX = MAR_L + (logo.data ? logo.w + 5 : 0);

  // Vertical rule after logo
  doc.setDrawColor(50, 50, 60);
  doc.setLineWidth(0.25);
  doc.line(textX - 2, 6, textX - 2, HEADER_H - 6);

  // "STAY MARINE"
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('STAY MARINE', textX, 15);

  // "stay-marine.com"
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.light);
  doc.text('stay-marine.com', textX, 21.5);

  // "DEGREE PLANNER" — right
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('DEGREE PLANNER', PAGE_W - MAR_R, 15, { align: 'right' });

  // Date — right
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.light);
  doc.text(today, PAGE_W - MAR_R, 21.5, { align: 'right' });
}

function drawThinHeader(doc: Doc) {
  doc.setFillColor(...C.nearBlk);
  doc.rect(0, 0, PAGE_W, THIN_H - 2, 'F');
  doc.setFillColor(...C.red);
  doc.rect(0, THIN_H - 2, PAGE_W, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('STAY MARINE', MAR_L, THIN_H - 5);

  doc.setTextColor(...C.light);
  doc.text('DEGREE PLANNER', PAGE_W - MAR_R, THIN_H - 5, { align: 'right' });
}

function drawFooter(doc: Doc, page: number, total: number) {
  const fy = PAGE_H - FOOTER_H;
  doc.setFillColor(...C.nearBlk);
  doc.rect(0, fy, PAGE_W, FOOTER_H, 'F');
  doc.setFillColor(...C.red);
  doc.rect(0, fy, PAGE_W, 1.5, 'F');

  const url = `${window.location.origin}/education/degree-planner`;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.light);
  doc.text(`STAY MARINE  ·  ${url}`, MAR_L, fy + 7.5);
  doc.text(`Page ${page} of ${total}`, PAGE_W - MAR_R, fy + 7.5, { align: 'right' });
}

// ── Content helpers ───────────────────────────────────────────────────────────────
function pageBreak(doc: Doc, yRef: { y: number }, needed: number) {
  if (yRef.y + needed > PAGE_H - MAR_B) {
    doc.addPage();
    drawThinHeader(doc);
    yRef.y = MAR_T_REST;
  }
}

function sectionHeader(doc: Doc, num: number, title: string, yRef: { y: number }) {
  pageBreak(doc, yRef, 12);

  // Numbered red box
  doc.setFillColor(...C.red);
  doc.rect(MAR_L, yRef.y - 4, 8, 5.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(String(num).padStart(2, '0'), MAR_L + 4, yRef.y, { align: 'center' });

  // Title
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text(title, MAR_L + 11, yRef.y);

  // Extending rule
  const ruleX = MAR_L + 12 + doc.getTextWidth(title) + 2;
  doc.setDrawColor(...C.pale);
  doc.setLineWidth(0.3);
  doc.line(ruleX, yRef.y - 1.5, PAGE_W - MAR_R, yRef.y - 1.5);

  yRef.y += 6;
}

function progressBar(doc: Doc, yRef: { y: number }, earnedPct: number, plannedPct: number) {
  pageBreak(doc, yRef, 26);

  const bh = 7, bw = CONTENT_W, bx = MAR_L, by = yRef.y;

  // Track
  doc.setFillColor(...C.bgAlt);
  doc.rect(bx, by, bw, bh, 'F');
  doc.setDrawColor(...C.pale);
  doc.setLineWidth(0.2);
  doc.rect(bx, by, bw, bh, 'S');

  // Planned
  const pw = bw * Math.min(plannedPct / 100, 1);
  const px = bx + bw * Math.min(earnedPct / 100, 1);
  if (pw > 0.1) { doc.setFillColor(215, 140, 140); doc.rect(px, by, pw, bh, 'F'); }

  // Earned
  const ew = bw * Math.min(earnedPct / 100, 1);
  if (ew > 0.1) { doc.setFillColor(...C.red); doc.rect(bx, by, ew, bh, 'F'); }

  // Divider tick
  if (ew > 0.1 && pw > 0.1) {
    doc.setDrawColor(...C.white); doc.setLineWidth(0.5);
    doc.line(px, by, px, by + bh);
  }

  yRef.y += bh + 4;
}

function statsRow(
  doc: Doc,
  yRef: { y: number },
  items: { label: string; value: string; color?: RGB }[],
) {
  pageBreak(doc, yRef, 14);
  const cw = CONTENT_W / items.length;

  for (let i = 0; i < items.length; i++) {
    const { label, value, color = C.text } = items[i];
    const cx = MAR_L + i * cw + cw / 2;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(value, cx, yRef.y, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(label, cx, yRef.y + 4.5, { align: 'center' });
  }

  yRef.y += 13;
}

function termHeader(doc: Doc, season: string, year: number, fy: number, yRef: { y: number }) {
  pageBreak(doc, yRef, 14);

  doc.setFillColor(...C.bgDark);
  doc.rect(MAR_L, yRef.y - 4, CONTENT_W, 6.5, 'F');
  doc.setFillColor(...C.red);
  doc.rect(MAR_L, yRef.y - 4, 2.5, 6.5, 'F');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(`${season.toUpperCase()} ${year}`, MAR_L + 6, yRef.y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.light);
  doc.text(`FY ${fy}`, PAGE_W - MAR_R - 2, yRef.y, { align: 'right' });

  yRef.y += 5;
}

function colHeaders(doc: Doc, yRef: { y: number }) {
  doc.setFillColor(...C.bgAlt);
  doc.rect(MAR_L, yRef.y - 3, CONTENT_W, 4.5, 'F');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.muted);
  ['COURSE', 'CR', '$/SH', 'FUNDING', 'STATUS', 'GR'].forEach((label, i) => {
    const x = MAR_L + [COL.name, COL.cr, COL.cost, COL.funding, COL.status, COL.grade][i];
    doc.text(label, x, yRef.y);
  });

  yRef.y += lh(6.5) + 1.5;
}

function courseRow(doc: Doc, course: Term['courses'][0], idx: number, yRef: { y: number }) {
  pageBreak(doc, yRef, 6);

  if (idx % 2 === 1) {
    doc.setFillColor(...C.bg);
    doc.rect(MAR_L, yRef.y - 3, CONTENT_W, 5, 'F');
  }

  const nameLines = doc.splitTextToSize(
    course.name.trim() || '(Unnamed)', COL.cr - COL.name - 2,
  ) as string[];

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  doc.text(nameLines[0], MAR_L + COL.name, yRef.y);

  doc.setTextColor(...C.mid);
  doc.text(String(course.credits),                          MAR_L + COL.cr,      yRef.y);
  doc.text(`$${course.costPerCredit}`,                      MAR_L + COL.cost,    yRef.y);
  doc.text(FUNDING_META[course.funding]?.label ?? '',       MAR_L + COL.funding, yRef.y);

  // Status dot + text
  const statusColor: Record<string, RGB> = {
    planned:      C.muted,
    'in-progress': [155, 90, 0],
    complete:     C.green,
  };
  const sc = statusColor[course.status] ?? C.muted;
  doc.setFillColor(...sc);
  doc.circle(MAR_L + COL.status - 2.5, yRef.y - 1.2, 1, 'F');
  doc.setTextColor(...sc);
  doc.text(COURSE_STATUS_META[course.status] ?? '', MAR_L + COL.status, yRef.y);

  if (course.grade) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(course.grade, MAR_L + COL.grade, yRef.y);
  }

  doc.setDrawColor(...C.bgAlt);
  doc.setLineWidth(0.15);
  doc.line(MAR_L, yRef.y + 1.5, PAGE_W - MAR_R, yRef.y + 1.5);

  yRef.y += lh(8.5) + 0.5;
}

function termTotals(doc: Doc, credits: number, cost: number, yRef: { y: number }) {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text(
    `${credits} cr total  ·  $${cost.toLocaleString()} total cost`,
    PAGE_W - MAR_R, yRef.y, { align: 'right' },
  );
  yRef.y += lh(7.5) + 5;
}

function taFyRow(doc: Doc, fy: number, used: number, yRef: { y: number }) {
  pageBreak(doc, yRef, 10);

  const funded = Math.min(used, TA_ANNUAL_MAX);
  const isOver = used > TA_ANNUAL_MAX;
  const pct    = Math.min(1, funded / TA_ANNUAL_MAX);

  const barX = MAR_L + 20, barW = 65, barH = 3, barY = yRef.y - 2.5;

  // FY label
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text(`FY ${fy}`, MAR_L + 4, yRef.y);

  // Mini progress bar
  doc.setFillColor(...C.bgAlt);
  doc.rect(barX, barY, barW, barH, 'F');
  doc.setDrawColor(...C.pale); doc.setLineWidth(0.1);
  doc.rect(barX, barY, barW, barH, 'S');
  doc.setFillColor(...(isOver ? [180, 60, 0] as RGB : C.red));
  doc.rect(barX, barY, barW * pct, barH, 'F');

  // Funded amount
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.mid);
  doc.text(`$${funded.toLocaleString()} / $${TA_ANNUAL_MAX.toLocaleString()}`, barX + barW + 3, yRef.y);

  // Status right
  if (isOver) {
    doc.setTextColor(...C.amber);
    doc.text(`OVER LIMIT — $${(used - TA_ANNUAL_MAX).toLocaleString()} gap`, PAGE_W - MAR_R, yRef.y, { align: 'right' });
  } else {
    doc.setTextColor(...C.green);
    doc.text(`$${(TA_ANNUAL_MAX - used).toLocaleString()} remaining`, PAGE_W - MAR_R, yRef.y, { align: 'right' });
  }

  yRef.y += lh(8.5) + 3;
}

// ── Public interface ──────────────────────────────────────────────────────────────
export interface DegreePlanPdfData {
  school: string;
  schoolDetails: SchoolDetails | null;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  requiredCredits: number;
  earnedCredits: number;
  plannedCredits: number;
  creditsToGo: number;
  terms: Term[];
  taByFY: Map<number, number>;
  totalTAFunded: number;
  totalTACost: number;
  totalUncovered: number;
  totalByFunding: Partial<Record<FundingSource, number>>;
  totalTuition: number;
  gpa: string | null;
  estimatedFinal: string;
}

const DEGREE_LABELS: Record<Exclude<DegreeLevel, ''>, string> = {
  associates: "Associate's Degree",
  bachelors:  "Bachelor's Degree",
  masters:    "Master's Degree",
};

const OWNERSHIP_LABELS: Record<number, string> = {
  1: 'Public',
  2: 'Private Non-Profit',
  3: 'Private For-Profit',
};

// ── Main ──────────────────────────────────────────────────────────────────────────
export async function generateDegreePlannerPdf(data: DegreePlanPdfData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const logo = await renderLogo(18);

  // ── Page 1 header ────────────────────────────────────────────────────────────
  drawHeader(doc, logo, today);
  const y = { y: MAR_T_P1 };

  // ── Intro: school + degree ───────────────────────────────────────────────────
  if (data.school) {
    const ownership = data.schoolDetails?.ownership
      ? ` — ${OWNERSHIP_LABELS[data.schoolDetails.ownership] ?? ''}`
      : '';
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(`${data.school}${ownership}`, MAR_L, y.y);
    y.y += lh(11);
  }

  const meta: string[] = [];
  if (data.fieldOfStudy) meta.push(data.fieldOfStudy);
  if (data.degreeLevel)  meta.push(data.requiredCredits
    ? `${DEGREE_LABELS[data.degreeLevel]} (${data.requiredCredits} cr)`
    : DEGREE_LABELS[data.degreeLevel]);
  if (meta.length) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(meta.join('  ·  '), MAR_L, y.y);
    y.y += lh(9);
  }

  y.y += 4;

  // ── 01 PROGRESS OVERVIEW ─────────────────────────────────────────────────────
  sectionHeader(doc, 1, 'PROGRESS OVERVIEW', y);

  if (data.requiredCredits > 0) {
    const ep = Math.min(100, (data.earnedCredits  / data.requiredCredits) * 100);
    const pp = Math.min(Math.max(0, 100 - ep), (data.plannedCredits / data.requiredCredits) * 100);
    progressBar(doc, y, ep, pp);
    statsRow(doc, y, [
      { label: 'CREDITS EARNED',  value: `${data.earnedCredits} cr`,  color: C.red },
      { label: 'CREDITS PLANNED', value: `${data.plannedCredits} cr`, color: [190, 80, 80] },
      { label: 'CREDITS TO GO',   value: `${data.creditsToGo} cr`,    color: C.muted },
      { label: 'CREDITS REQUIRED',value: `${data.requiredCredits} cr`,color: C.text },
    ]);
  }

  if (data.estimatedFinal) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(`Estimated Completion: ${data.estimatedFinal}`, MAR_L, y.y);
    y.y += lh(8.5);
  }

  y.y += 4;

  // ── 02 COURSE PLAN ────────────────────────────────────────────────────────────
  sectionHeader(doc, 2, 'COURSE PLAN', y);

  if (data.terms.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.light);
    doc.text('No terms have been added yet.', MAR_L, y.y);
    y.y += lh(9) + 4;
  } else {
    for (const term of data.terms) {
      const fy = fiscalYear(term.season, term.year);
      termHeader(doc, term.season, term.year, fy, y);

      if (term.courses.length === 0) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.light);
        doc.text('No courses added', MAR_L + 4, y.y);
        y.y += lh(8.5) + 3;
      } else {
        colHeaders(doc, y);
        term.courses.forEach((c, i) => courseRow(doc, c, i, y));
        const cr = term.courses.reduce((s, c) => s + c.credits, 0);
        const ct = term.courses.reduce((s, c) => s + c.credits * c.costPerCredit, 0);
        termTotals(doc, cr, ct, y);
      }
    }
  }

  // ── 03 TA BUDGET ─────────────────────────────────────────────────────────────
  sectionHeader(doc, 3, 'TUITION ASSISTANCE BUDGET', y);
  y.y += 2;

  if (data.taByFY.size === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.light);
    doc.text('No TA-funded courses planned.', MAR_L, y.y);
    y.y += lh(9) + 4;
  } else {
    [...data.taByFY.entries()].sort(([a], [b]) => a - b).forEach(([fy, used]) => taFyRow(doc, fy, used, y));

    y.y += 1;
    pageBreak(doc, y, 8);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(`Total TA Funded: $${data.totalTAFunded.toLocaleString()}`, MAR_L + 4, y.y);
    if (data.totalUncovered > 0) {
      doc.setTextColor(...C.amber);
      doc.text(`Uncovered Gap: $${data.totalUncovered.toLocaleString()}`, PAGE_W - MAR_R, y.y, { align: 'right' });
    }
    y.y += lh(8.5) + 5;
  }

  // ── 04 COST SUMMARY ──────────────────────────────────────────────────────────
  sectionHeader(doc, 4, 'COST SUMMARY', y);
  y.y += 2;

  const fundingOrder: FundingSource[] = ['ta', 'gi-bill', 'fafsa', 'scholarship', 'oop'];
  const hasFunding = fundingOrder.some(s => (data.totalByFunding[s] ?? 0) > 0);

  if (hasFunding) {
    for (const src of fundingOrder) {
      const amt = data.totalByFunding[src] ?? 0;
      if (!amt) continue;
      pageBreak(doc, y, 6);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.mid);
      doc.text(FUNDING_META[src].full, MAR_L + 4, y.y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.text);
      doc.text(`$${amt.toLocaleString()}`, PAGE_W - MAR_R, y.y, { align: 'right' });
      y.y += lh(8.5) + 0.5;
    }

    y.y += 2;
    doc.setDrawColor(...C.pale);
    doc.setLineWidth(0.3);
    doc.line(MAR_L + 4, y.y, PAGE_W - MAR_R, y.y);
    y.y += 4;

    pageBreak(doc, y, 8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text('Total Tuition', MAR_L + 4, y.y);
    doc.text(`$${data.totalTuition.toLocaleString()}`, PAGE_W - MAR_R, y.y, { align: 'right' });
    y.y += lh(10) + 2;
  }

  if (data.gpa) {
    pageBreak(doc, y, 6);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(`GPA (completed courses): ${data.gpa}`, MAR_L + 4, y.y);
  }

  // ── Footers ───────────────────────────────────────────────────────────────────
  const total = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(doc, p, total);
  }

  return doc.output('blob');
}
