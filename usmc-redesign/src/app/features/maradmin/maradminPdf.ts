import type { RSSMessage, ContentSection, ContentSubSection } from './maradminUtils';

const PAGE_W = 215.9;   // letter width mm
const PAGE_H = 279.4;   // letter height mm
const MAR_L  = 19;
const MAR_R  = 19;
const MAR_T  = 22;
const MAR_B  = 19;
const CONTENT_W = PAGE_W - MAR_L - MAR_R;

function lh(fontSize: number, factor = 1.45) {
  return fontSize * 0.352778 * factor;
}

type DocType = InstanceType<typeof import('jspdf').jsPDF>;

function writeText(
  doc: DocType,
  text: string,
  fontSize: number,
  yRef: { y: number },
  opts: { bold?: boolean; color?: [number, number, number]; indent?: number } = {},
) {
  const { bold = false, color = [30, 30, 30], indent = 0 } = opts;
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setTextColor(color[0], color[1], color[2]);

  const maxW = CONTENT_W - indent;
  const lines = doc.splitTextToSize(text.trim(), maxW) as string[];
  const blockH = lines.length * lh(fontSize);

  if (yRef.y + blockH > PAGE_H - MAR_B) {
    doc.addPage();
    yRef.y = MAR_T;
  }

  doc.text(lines, MAR_L + indent, yRef.y);
  yRef.y += blockH;
}

function writeSubSection(doc: DocType, sub: ContentSubSection, yRef: { y: number }, depth = 0) {
  const indent = depth * 6;
  if (sub.label) writeText(doc, sub.label, 10, yRef, { bold: true, color: [50, 50, 50], indent });
  if (sub.body)  writeText(doc, sub.body,  9.5, yRef, { indent: indent + 3 });

  for (const table of sub.tables ?? []) {
    if (table.title) writeText(doc, table.title, 9.5, yRef, { bold: true, indent: indent + 3 });
    const colCount = table.headers.length;
    const colW = (CONTENT_W - indent - 3) / colCount;
    for (const row of [table.headers, ...table.rows]) {
      row.forEach((cell, i) => {
        const x = MAR_L + indent + 3 + i * colW;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', row === table.headers ? 'bold' : 'normal');
        doc.setTextColor(30, 30, 30);
        const wrapped = doc.splitTextToSize(cell, colW - 2) as string[];
        doc.text(wrapped, x, yRef.y);
      });
      yRef.y += lh(8.5) + 0.5;
    }
    yRef.y += 1;
  }

  for (const child of sub.children ?? []) {
    writeSubSection(doc, child, yRef, depth + 1);
  }
}

export async function generateMARADMINPdf(
  msg: RSSMessage,
  sections: ContentSection[],
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const yRef = { y: MAR_T };

  // Header block
  writeText(doc, `MARADMIN ${msg.number}`, 20, yRef, { bold: true, color: [180, 0, 0] });
  yRef.y += 1;
  writeText(doc, `${msg.displayDate}  ·  ${msg.source}`, 9, yRef, { color: [110, 110, 110] });
  yRef.y += 2;
  writeText(doc, msg.subject, 12, yRef, { bold: true, color: [40, 40, 40] });
  yRef.y += 3;

  // Rule
  doc.setDrawColor(180, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(MAR_L, yRef.y, PAGE_W - MAR_R, yRef.y);
  yRef.y += 5;

  // Sections
  for (const section of sections) {
    writeText(doc, section.heading, 11, yRef, { bold: true, color: [160, 20, 20] });
    yRef.y += 1;

    if (section.body) {
      writeText(doc, section.body, 9.5, yRef, { indent: 3 });
      yRef.y += 1;
    }

    for (const bullet of section.bullets ?? []) {
      writeSubSection(doc, bullet, yRef, 1);
      yRef.y += 0.5;
    }

    for (const table of section.tables ?? []) {
      if (table.title) writeText(doc, table.title, 9.5, yRef, { bold: true, indent: 3 });
      const colCount = table.headers.length;
      const colW = (CONTENT_W - 3) / colCount;
      for (const row of [table.headers, ...table.rows]) {
        row.forEach((cell, i) => {
          const x = MAR_L + 3 + i * colW;
          doc.setFontSize(8.5);
          doc.setFont('helvetica', row === table.headers ? 'bold' : 'normal');
          doc.setTextColor(30, 30, 30);
          const wrapped = doc.splitTextToSize(cell, colW - 2) as string[];
          doc.text(wrapped, x, yRef.y);
        });
        yRef.y += lh(8.5) + 0.5;
      }
      yRef.y += 2;
    }

    yRef.y += 3;
  }

  // Footer on every page
  const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  const siteUrl = `${window.location.origin}/messages/${msg.number}`;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text(`MARADMIN ${msg.number}  ·  ${siteUrl}`, MAR_L, PAGE_H - 8);
    doc.text(`Page ${p} of ${totalPages}`, PAGE_W - MAR_R, PAGE_H - 8, { align: 'right' });
  }

  return doc.output('blob');
}

export function maradminEmailBody(msg: RSSMessage, sections: ContentSection[]): string {
  const lines: string[] = [
    `MARADMIN ${msg.number}`,
    `${msg.displayDate}  ·  ${msg.source}`,
    msg.subject,
    '',
    '─'.repeat(60),
    '',
  ];

  for (const section of sections) {
    lines.push(section.heading);
    if (section.body) lines.push(section.body, '');
    for (const bullet of section.bullets ?? []) {
      lines.push(`  ${bullet.label}`);
      if (bullet.body) lines.push(`    ${bullet.body}`);
      for (const child of bullet.children ?? []) {
        lines.push(`    ${child.label}`);
        if (child.body) lines.push(`      ${child.body}`);
      }
    }
    lines.push('');
  }

  lines.push('─'.repeat(60));
  lines.push(`View online: ${window.location.origin}/messages/${msg.number}`);
  return lines.join('\n');
}
