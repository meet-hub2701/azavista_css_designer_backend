import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchWebsiteHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch website: ${error}`);
  }
}

export function injectCustomCSS(html: string, customCSS: string, baseUrl: string): string {
  const $ = cheerio.load(html);
  
  // Fix relative URLs to absolute
  $('link[href]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      $(elem).attr('href', new URL(href, baseUrl).href);
    }
  });
  
  $('script[src]').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('//')) {
      $(elem).attr('src', new URL(src, baseUrl).href);
    }
  });
  
  $('img[src]').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
      $(elem).attr('src', new URL(src, baseUrl).href);
    }
  });
  
  // Inject custom CSS
  const styleTag = `
    <style id="custom-theme-css">
      ${customCSS}
    </style>
  `;
  
  $('head').append(styleTag);
  
  // Add base tag for relative URLs
  if (!$('base').length) {
    $('head').prepend(`<base href="${baseUrl}">`);
  }
  
  return $.html();
}

export function extractCSSFromWebsite(html: string): {
  colors: string[];
  fonts: string[];
  selectors: { selector: string; type: string }[];
  css: string;
} {
  const $ = cheerio.load(html);
  
  const colors: Set<string> = new Set();
  const fonts: Set<string> = new Set();
  const selectors: { selector: string; type: string }[] = [];
  let extractedCSS = '';
  
  // Extract common selectors
  const selectorMap = {
    header: 'header, .header, #header, nav, .navbar',
    footer: 'footer, .footer, #footer',
    button: 'button, .btn, .button, input[type="submit"]',
    card: '.card, .box, .panel, article',
    form: 'form, .form',
  };
  
  Object.entries(selectorMap).forEach(([type, selector]) => {
    if ($(selector).length > 0) {
      selectors.push({ selector, type });
    }
  });
  
  // Extract inline styles for color analysis
  $('[style]').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const colorMatches = style.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
    if (colorMatches) {
      colorMatches.forEach(color => colors.add(color));
    }
  });
  
  // Extract CSS from style tags
  $('style').each((_, elem) => {
    extractedCSS += $(elem).html() + '\n';
  });
  
  // Extract CSS from link tags (just the URLs)
  $('link[rel="stylesheet"]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (href) {
      extractedCSS += `/* External CSS: ${href} */\n`;
    }
  });
  
  return {
    colors: Array.from(colors).slice(0, 10),
    fonts: Array.from(fonts),
    selectors,
    css: extractedCSS,
  };
}

export async function extractCompleteWebsite(url: string): Promise<{
  html: string;
  css: string;
  baseUrl: string;
}> {
  try {
    const html = await fetchWebsiteHTML(url);
    const $ = cheerio.load(html);
    const baseUrl = url;
    
    // REMOVE ALL SCRIPTS to prevent errors and flashing
    $('script').remove();
    
    // Fix all relative URLs to absolute
    $('link[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        $(elem).attr('href', new URL(href, baseUrl).href);
      }
    });
    
    $('img[src]').each((_, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        $(elem).attr('src', new URL(src, baseUrl).href);
      }
    });
    
    // Extract CSS
    let css = '';
    $('style').each((_, elem) => {
      css += $(elem).html() + '\n';
    });
    
    return {
      html: $.html(),
      css,
      baseUrl,
    };
  } catch (error) {
    throw new Error(`Failed to extract website: ${error}`);
  }
}
