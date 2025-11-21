import * as cheerio from 'cheerio';
import type { InjectionPoint } from '../shared-types';

export function analyzeDOMForInjection(html: string): InjectionPoint[] {
  const $ = cheerio.load(html);
  const injectionPoints: InjectionPoint[] = [];

  // Find header/top injection points
  if ($('header').length > 0) {
    injectionPoints.push({
      selector: 'header',
      label: 'Header (Inside)',
      description: 'Inside the header element',
      elementType: 'header',
      position: 'top'
    });
  }

  if ($('body').length > 0) {
    injectionPoints.push({
      selector: 'body',
      label: 'Body (Top)',
      description: 'At the beginning of body',
      elementType: 'body',
      position: 'top'
    });
  }

  // Find main content area
  const mainSelectors = ['main', '#main', '.main', '#content', '.content'];
  for (const selector of mainSelectors) {
    if ($(selector).length > 0) {
      injectionPoints.push({
        selector,
        label: `Main Content (${selector})`,
        description: 'Inside main content area',
        elementType: 'main',
        position: 'middle'
      });
      break;
    }
  }

  // Find footer injection points
  if ($('footer').length > 0) {
    injectionPoints.push({
      selector: 'footer',
      label: 'Footer (Inside)',
      description: 'Inside the footer element',
      elementType: 'footer',
      position: 'bottom'
    });
  }

  // Body bottom
  injectionPoints.push({
    selector: 'body',
    label: 'Body (Bottom)',
    description: 'At the end of body',
    elementType: 'body',
    position: 'bottom'
  });

  // Find container elements
  const containers = ['.container', '.wrapper', '#wrapper', '.page'];
  for (const selector of containers) {
    if ($(selector).length > 0) {
      injectionPoints.push({
        selector,
        label: `Container (${selector})`,
        description: 'Inside container element',
        elementType: 'container',
        position: 'middle'
      });
    }
  }

  return injectionPoints;
}

export function generateInjectionCode(
  htmlContent: string,
  cssContent: string,
  targetSelector: string,
  method: string
): string {
  const scopedCSS = scopeCSS(cssContent);
  
  return `
(function() {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = \`${scopedCSS}\`;
  document.head.appendChild(style);

  // Inject HTML
  const target = document.querySelector('${targetSelector}');
  if (target) {
    const section = document.createElement('div');
    section.innerHTML = \`${htmlContent}\`;
    const element = section.firstElementChild;
    
    switch('${method}') {
      case 'prepend':
        target.prepend(element);
        break;
      case 'append':
        target.append(element);
        break;
      case 'before':
        target.before(element);
        break;
      case 'after':
        target.after(element);
        break;
      case 'replace':
        target.replaceWith(element);
        break;
    }
  }
})();
  `.trim();
}

function scopeCSS(css: string): string {
  // Add a unique prefix to prevent conflicts
  // This is a simple implementation - could be enhanced with a CSS parser
  return css.replace(/\.sf-/g, '.styleforge-');
}
