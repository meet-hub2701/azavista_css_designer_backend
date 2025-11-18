import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { WebsiteAnalysis, ElementMap } from '../../../shared/src/types';

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const html = await page.content();
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });
    
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

    await browser.close();

    return {
      url,
      elements,
      screenshot: `data:image/png;base64,${screenshot}`,
      analyzedAt: new Date(),
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function generateSelector(element: cheerio.Cheerio<any>): string | null {
  const tag = element.prop('tagName')?.toLowerCase();
  const id = element.attr('id');
  const classes = element.attr('class')?.split(' ').filter(c => c.trim());

  if (id) return `#${id}`;
  if (classes && classes.length > 0) return `.${classes[0]}`;
  return tag || null;
}
