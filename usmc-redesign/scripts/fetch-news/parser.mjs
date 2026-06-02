/**
 * Node-native RSS 2.0 parser — no external dependencies, no browser APIs.
 *
 * Handles:
 *   - CDATA sections  (<tag><![CDATA[...]]></tag>)
 *   - HTML entities   (&amp; &#160; &#x00A0; etc.)
 *   - Namespaced tags (dc:creator, media:content, etc.)
 *   - Self-closing enclosure elements
 *   - Link tags that are void elements (no closing tag) in some feeds
 */

/** @param {string} str */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/**
 * Extract text content from a tag, handling CDATA.
 * @param {string} xml
 * @param {string} tag  — plain tag name, e.g. 'title' or 'dc:creator'
 * @returns {string | null}
 */
function extractTag(xml, tag) {
  const escaped = tag.replace(':', '\\:');
  // CDATA variant
  const cdataRe = new RegExp(
    `<${escaped}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escaped}>`,
    'i',
  );
  const cdata = cdataRe.exec(xml);
  if (cdata) return cdata[1].trim();

  // Plain text variant
  const plainRe = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  const plain = plainRe.exec(xml);
  if (plain) return plain[1].trim();

  return null;
}

/**
 * Extract an attribute value from a self-closing or opening tag.
 * @param {string} xml
 * @param {string} tag
 * @param {string} attr
 * @returns {string | null}
 */
function extractAttr(xml, tag, attr) {
  const escaped = tag.replace(':', '\\:');
  const tagRe = new RegExp(`<${escaped}\\s+([^>]*)>`, 'i');
  const tagMatch = tagRe.exec(xml);
  if (!tagMatch) return null;

  const attrRe = new RegExp(`${attr}=["']([^"']*)["']`, 'i');
  const attrMatch = attrRe.exec(tagMatch[1]);
  return attrMatch ? attrMatch[1] : null;
}

/**
 * Find an image URL from an RSS item.
 * Checks (in order): enclosure, media:content, media:thumbnail.
 * @param {string} itemXml
 * @returns {string | null}
 */
function extractImageUrl(itemXml) {
  // <enclosure type="image/..." url="..." />
  const encType = extractAttr(itemXml, 'enclosure', 'type');
  if (encType?.startsWith('image/')) {
    const url = extractAttr(itemXml, 'enclosure', 'url');
    if (url) return url;
  }

  // <media:content url="..." medium="image" />
  const mediaUrl = extractAttr(itemXml, 'media:content', 'url');
  if (mediaUrl) return mediaUrl;

  // <media:thumbnail url="..." />
  const thumbUrl = extractAttr(itemXml, 'media:thumbnail', 'url');
  if (thumbUrl) return thumbUrl;

  return null;
}

/**
 * Strip HTML tags and collapse whitespace.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Decode text fields that are not expected to contain HTML markup.
 * @param {string | null} text
 * @returns {string | null}
 */
function decodeText(text) {
  return text == null ? null : decodeEntities(text).trim();
}

/**
 * Parse all <item> elements from an RSS XML string.
 *
 * @param {string} xml
 * @returns {Array<{
 *   title: string,
 *   link: string,
 *   guid: string,
 *   description: string,
 *   pubDate: string | null,
 *   category: string | null,
 *   author: string | null,
 *   imageUrl: string | null,
 * }>}
 */
export function parseRssItems(xml) {
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  const items = [];
  let match;

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];

    const rawTitle = extractTag(block, 'title') ?? '';
    const rawDesc = extractTag(block, 'description') ?? '';
    const link = decodeText(extractTag(block, 'link') ?? extractTag(block, 'guid')) ?? '';
    const guid = decodeText(extractTag(block, 'guid')) ?? link;

    items.push({
      title: stripHtml(rawTitle),
      link: link.trim(),
      guid: guid.trim(),
      description: stripHtml(rawDesc),
      pubDate: decodeText(extractTag(block, 'pubDate')),
      category: decodeText(extractTag(block, 'category')),
      author: decodeText(extractTag(block, 'dc:creator') ?? extractTag(block, 'author')),
      imageUrl: extractImageUrl(block),
    });
  }

  return items;
}
