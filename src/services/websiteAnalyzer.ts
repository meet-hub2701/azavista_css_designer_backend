import * as cheerio from 'cheerio';
import { WebsiteAnalysis, ElementMap } from '../shared-types';

export interface ExtractedSection {
  type: 'header' | 'hero' | 'footer' | 'cta' | 'features' | 'content';
  name: string;
  html: string;
  css: string;
  selector: string;
}

export function extractSectionsFromHTML(html: string, css: string, sourceUrl?: string): ExtractedSection[] {
  const $ = cheerio.load(html);
  const sections: ExtractedSection[] = [];
  const processedElements = new Set<any>();

  // Helper to clean HTML but preserve visual content
  const cleanAssets = (htmlContent: string): string => {
    // We no longer strip SVGs or Images aggressively
    // Just ensure scripts are gone (handled by cheerio .remove())
    return htmlContent;
  };

  // Helper to add a section
  const addSection = (element: cheerio.Cheerio<any>, type: ExtractedSection['type'], defaultName: string) => {
    if (element.length === 0) return;
    
    // Check if already processed (using the raw DOM element)
    if (processedElements.has(element[0])) return;
    processedElements.add(element[0]);

    // Remove scripts/styles from within the section to keep it clean
    element.find('script, style, link[rel="stylesheet"]').remove();

    // Try to derive a better name from ID or Class
    let name = defaultName;
    const id = element.attr('id');
    const className = element.attr('class');
    
    if (id) {
      name = id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, ' ');
    } else if (className) {
      // Take the first meaningful class
      const firstClass = className.split(' ').find(c => !['section', 'container', 'row', 'col'].includes(c));
      if (firstClass) {
        name = firstClass.charAt(0).toUpperCase() + firstClass.slice(1).replace(/[-_]/g, ' ');
      }
    }

    sections.push({
      type,
      name,
      html: cleanAssets($.html(element)),
      css: extractRelevantCSS(css, element, $),
      selector: generateSelector(element) || 'div'
    });
  };

  // 1. Extract Header
  const header = $('header, .header, .navbar, #header').first();
  addSection(header, 'header', 'Header');

  // 2. Extract Hero (often the first section or div with h1)
  let hero = $('.hero, #hero').first();
  if (hero.length === 0) {
    // Fallback: First section that contains an h1 and isn't the header
    hero = $('section, div').filter((_, el) => {
      return $(el).find('h1').length > 0 && !processedElements.has(el);
    }).first();
  }
  addSection(hero, 'hero', 'Hero Section');

  // 3. Extract Footer
  const footer = $('footer, .footer, #footer').last();
  addSection(footer, 'footer', 'Footer');

  // 4. Extract Content Sections
  // Look for semantic tags and significant divs
  const contentCandidates = $('section, article, main > div, .section, .container > div');
  
  let sectionCount = 1;
  contentCandidates.each((_, el) => {
    const element = $(el);
    
    // Skip if already processed or inside an already processed element (simple check)
    if (processedElements.has(el)) return;
    
    // Skip small/insignificant elements (heuristic: must have some text or children)
    if (element.text().trim().length < 20 && element.children().length === 0) return;

    // Determine type
    let type: ExtractedSection['type'] = 'content';
    if (element.find('form').length > 0) type = 'cta';
    if (element.find('.feature, .card, .item').length > 2) type = 'features';

    addSection(element, type, `Section ${sectionCount++}`);
  });

  // 5. Fallback: If we found nothing but header/footer, try direct body children
  if (sections.length <= 2) {
    $('body > div').each((_, el) => {
      const element = $(el);
      if (!processedElements.has(el) && element.text().trim().length > 50) {
        addSection(element, 'content', `Section ${sectionCount++}`);
      }
    });
  }

  return sections;
}

function extractRelevantCSS(fullCSS: string, element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
  // Improved CSS extraction:
  // 1. Get the main selector for the element
  // 2. Get selectors for children
  // 3. Filter fullCSS for these selectors
  
  const mainSelector = generateSelector(element);
  if (!mainSelector) return '';

  const relevantCSS: string[] = [];
  
  // 1. Always include :root variables and @font-face
  const rootMatches = fullCSS.match(/:root\s*{[^}]*}/g);
  if (rootMatches) relevantCSS.push(...rootMatches);
  
  const fontFaceMatches = fullCSS.match(/@font-face\s*{[^}]*}/g);
  if (fontFaceMatches) relevantCSS.push(...fontFaceMatches);

  // 2. Collect child classes/ids to broaden search
  const selectorsToFind = new Set<string>([mainSelector]);
  element.find('*').each((_, el) => {
    const sel = generateSelector($(el));
    if (sel) selectorsToFind.add(sel);
  });

  // Escape special regex characters
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 3. Find direct matches and matches inside media queries
  const cssBlocks = fullCSS.split('}'); // Simple split, not perfect but fast
  
  Array.from(selectorsToFind).forEach(selector => {
    if (!selector) return;
    const escapedSelector = escapeRegExp(selector);
    
    // Regex for direct selector: selector { ...
    // And selector with pseudo-classes: selector:hover { ...
    const selectorRegex = new RegExp(`${escapedSelector}([:\\s][^{]*)?{`, 'i');

    // Scan through blocks to find matches (including media queries)
    // This is a naive parser but better than strict regex for nested blocks
    // For a robust solution, we'd need a real CSS parser, but this is a quick improvement
    
    // Revert to regex for simple blocks for now to avoid complexity, but add media query support
    try {
      // Match direct blocks
      const directRegex = new RegExp(`${escapedSelector}([:\\s][^{]*)?\\s*{[^}]*}`, 'gi');
      const directMatches = fullCSS.match(directRegex);
      if (directMatches) relevantCSS.push(...directMatches);

      // Match inside media queries (simple heuristic)
      // @media ... { ... selector ... { ... } }
      // This is hard with regex. Instead, let's just grab ALL media queries for now if they seem relevant?
      // No, that's too much.
      
      // Let's try to capture the block if it's inside a media query
      // We'll look for: @media [^{]+ { [^}]+ selector [^}]+ {
      // This is getting complicated.
      
      // Alternative: Just include ALL media queries? 
      // User said "looking so much bad". Missing media queries is a huge cause.
      // Let's include all @media blocks that contain any of our selectors.
      
      const mediaRegex = /@media[^{]+\{([\s\S]+?)\}\s*\}/g;
      let match;
      while ((match = mediaRegex.exec(fullCSS)) !== null) {
        if (match[1].includes(selector)) {
           relevantCSS.push(match[0]);
        }
      }
    } catch (e) {
      // Ignore regex errors
    }
  });

  // Deduplicate
  const uniqueCSS = Array.from(new Set(relevantCSS));

  // Limit the output size
  const result = uniqueCSS.join('\n');
  return result.length > 100000 ? result.substring(0, 100000) + '\n/* Truncated... */' : result;
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  // Use the proxy service instead of puppeteer
  const { extractCompleteWebsite } = await import('./websiteProxy.js');
  const extracted = await extractCompleteWebsite(url);
  const html = extracted.html;
  
  const $ = cheerio.load(html);
  
  const elements: ElementMap = {
    headers: [],
    buttons: [],
    forms: [],
    navigation: [],
    cards: [],
  };

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const selector = generateSelector($(el));
    if (selector) elements.headers.push(selector);
  });

  $('button, input[type="button"], input[type="submit"], a.btn, .button').each((_, el) => {
    const selector = generateSelector($(el));
    if (selector) elements.buttons.push(selector);
  });

  $('form, input, textarea, select').each((_, el) => {
    const selector = generateSelector($(el));
    if (selector) elements.forms.push(selector);
  });

  $('nav, header, .nav, .navbar, .navigation').each((_, el) => {
    const selector = generateSelector($(el));
    if (selector) elements.navigation.push(selector);
  });

  $('.card, .panel, article, .box').each((_, el) => {
    const selector = generateSelector($(el));
    if (selector) elements.cards.push(selector);
  });

  return {
    url,
    elements,
    analyzedAt: new Date(),
  };
}

function generateSelector(element: cheerio.Cheerio<any>): string | null {
  const tag = element.prop('tagName')?.toLowerCase();
  const id = element.attr('id');
  const classes = element.attr('class')?.split(' ').filter(c => c.trim());

  if (id) return `#${id}`;
  if (classes && classes.length > 0) return `.${classes[0]}`;
  return tag || null;
}
