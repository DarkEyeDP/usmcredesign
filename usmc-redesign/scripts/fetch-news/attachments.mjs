/**
 * Manual attachments registry.
 *
 * When an article has an associated document (PDF, etc.) that isn't linked
 * in the RSS feed itself, add it here. The fetch script applies these to
 * the matching item before writing news.json.
 *
 * Key: the article's GUID or canonical URL (check the id field in news.json).
 *
 * Each attachment:
 *   label — display text shown in the UI
 *   url   — direct link to the document
 *   type  — 'pdf' | 'doc' | 'file'
 */

/** @type {Record<string, Array<{ label: string, url: string, type: 'pdf' | 'doc' | 'file' }>>} */
export const MANUAL_ATTACHMENTS = {
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4483464/department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan/': [
    {
      label: 'FY2027 Navy Shipbuilding Plan',
      url: 'https://media.defense.gov/2026/May/11/2003928909/-1/-1/1/NAVY%20SHIPBUILDING%20PLAN%20MAY%202026.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4402473/2026-marine-corps-aviation-plan/': [
    {
      label: '2026 Marine Corps Aviation Plan',
      url: 'https://media.defense.gov/2026/Feb/10/2003873872/-1/-1/0/260210-USMC-2026-AVIATION-PLAN.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4402085/marine-corps-passes-fy25-financial-audit/': [
    {
      label: 'FY2025 USMC Annual Financial Report',
      url: 'https://media.defense.gov/2026/Feb/09/2003873501/-1/-1/0/260209_FY2025_USMC_AFR.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4358866/navair-releases-v-22-comprehensive-review-findings/': [
    {
      label: 'V-22 Comprehensive Review',
      url: 'https://www.secnav.navy.mil/foia/readingroom/HotTopics/V-22%20Review/V-22%20Comprehensive%20Review%20(Distro%20A).pdf',
      type: 'pdf',
    },
  ],
};
