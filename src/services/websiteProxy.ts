import axios from 'axios';
import * as cheerio from 'cheerio';

import puppeteer from 'puppeteer';

export async function fetchWebsiteHTML(url: string): Promise<string> {
  const commonHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };

  const chromeHeaders = {
    ...commonHeaders,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
  };

  const firefoxHeaders = {
    ...commonHeaders,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  };

  try {
    // Attempt 1: Chrome headers
    const response = await axios.get(url, {
      headers: chromeHeaders,
      timeout: 15000,
      maxRedirects: 5,
    });
    return response.data;
  } catch (error: any) {
    console.log(`First attempt failed for ${url}: ${error.message}. Retrying with fallback headers...`);
    
    try {
      // Attempt 2: Firefox headers (Fallback)
      const response = await axios.get(url, {
        headers: firefoxHeaders,
        timeout: 15000,
        maxRedirects: 5,
      });
      return response.data;
    } catch (retryError: any) {
      console.log(`Second attempt failed for ${url}: ${retryError.message}. Retrying with Puppeteer...`);
      
      try {
        // Attempt 3: Puppeteer (Ultimate Fallback)
        return await fetchWithPuppeteer(url);
      } catch (puppeteerError: any) {
        throw new Error(`Failed to fetch website after retries: ${puppeteerError.message}`);
      }
    }
  }
}

async function fetchWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate and wait for network idle to ensure dynamic content loads
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const content = await page.content();
    return content;
  } finally {
    await browser.close();
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
    primaryColor: string;
    secondaryColor: string;
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
    backgroundColor: 'transparent',
    color: '#212529',
    fontFamily: 'inherit',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
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
    
    // Extract CSS (both inline and external)
    let css = '';
    
    // Fetch external stylesheets
    const links = $('link[rel="stylesheet"]').toArray();
    for (const link of links) {
      const href = $(link).attr('href');
      if (href) {
        try {
          console.log(`Fetching external CSS: ${href}`);
          let cssContent = await fetchWebsiteHTML(href);
          // Fix relative URLs in the CSS (images, fonts) relative to the CSS file location
          cssContent = fixCSSUrls(cssContent, href);
          
          css += `/* External CSS: ${href} */\n${cssContent}\n`;
          // Remove the link tag since we've inlined it
          $(link).remove();
        } catch (e: any) {
          console.warn(`Failed to fetch CSS ${href}: ${e.message}`);
          // Keep the link tag if we failed to fetch it, so the browser might still try
        }
      }
    }

    // Extract inline styles
    $('style').each((_, elem) => {
      css += $(elem).html() + '\n';
      $(elem).remove(); // Remove inline styles as they are now in our global css string
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

// Helper to fix relative URLs in CSS
function fixCSSUrls(css: string, cssUrl: string): string {
  return css.replace(/url\((['"]?)([^)'"]+)\1\)/g, (match, quote, url) => {
    if (!url || url.trim().startsWith('data:') || url.trim().startsWith('http') || url.trim().startsWith('//')) {
      return match;
    }
    try {
      // Resolve relative URL against the CSS file's URL
      const absoluteUrl = new URL(url.trim(), cssUrl).href;
      return `url(${quote || ''}${absoluteUrl}${quote || ''})`;
    } catch (e) {
      return match;
    }
  });
}
