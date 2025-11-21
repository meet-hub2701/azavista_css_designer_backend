import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchWebsiteHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
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
  globalStyles: {
    backgroundColor: string;
    color: string;
    fontFamily: string;
  };
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

  // Extract fonts from CSS content
  const fontMatches = extractedCSS.match(/font-family:\s*([^;]+)/g);
  if (fontMatches) {
    fontMatches.forEach(match => {
      // Clean up the font family string
      const font = match.replace(/font-family:\s*/, '').trim();
      // Split by comma to get individual fonts if multiple are defined
      const individualFonts = font.split(',').map(f => f.trim().replace(/['"]/g, ''));
      individualFonts.forEach(f => {
        if (f && !['inherit', 'initial', 'unset'].includes(f.toLowerCase())) {
          fonts.add(f);
        }
      });
    });
  }
  
  // Extract global styles (simple heuristic)
  let globalStyles = {
    backgroundColor: '#ffffff',
    color: '#212529',
    fontFamily: 'inherit'
  };

  // Try to find body styles in extracted CSS
  const bodyMatch = extractedCSS.match(/body\s*{([^}]+)}/);
  if (bodyMatch) {
    const bodyStyles = bodyMatch[1];
    const bgMatch = bodyStyles.match(/background-color:\s*([^;]+)/);
    const colorMatch = bodyStyles.match(/color:\s*([^;]+)/);
    const fontMatch = bodyStyles.match(/font-family:\s*([^;]+)/);
    
    if (bgMatch) globalStyles.backgroundColor = bgMatch[1].trim();
    if (colorMatch) globalStyles.color = colorMatch[1].trim();
    if (fontMatch) globalStyles.fontFamily = fontMatch[1].trim();
  }

  return {
    colors: Array.from(colors).slice(0, 10),
    fonts: Array.from(fonts),
    selectors,
    css: extractedCSS,
    globalStyles
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
