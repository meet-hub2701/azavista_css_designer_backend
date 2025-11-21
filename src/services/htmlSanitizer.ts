// HTML Sanitization Service
// In production, use DOMPurify or similar library

export function sanitizeHTML(html: string, sourceUrl?: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Fix relative URLs if source URL is provided
  if (sourceUrl) {
    try {
      const baseUrl = new URL(sourceUrl);
      const origin = baseUrl.origin;
      
      // Fix src attributes (images, iframes, etc.)
      sanitized = sanitized.replace(/src=["']\/([^"']+)["']/gi, (match, path) => {
        return `src="${origin}/${path}"`;
      });
      
      // Fix href attributes (links, stylesheets)
      sanitized = sanitized.replace(/href=["']\/([^"']+)["']/gi, (match, path) => {
        // Skip anchor links
        if (path.startsWith('#')) return match;
        return `href="${origin}/${path}"`;
      });
      
      // Fix background images in style attributes
      sanitized = sanitized.replace(/url\(["']?\/([^"')]+)["']?\)/gi, (match, path) => {
        return `url("${origin}/${path}")`;
      });
    } catch (e) {
      console.error('Error fixing URLs:', e);
    }
  }
  
  return sanitized;
}

export function sanitizeCSS(css: string): string {
  // Remove @import statements
  let sanitized = css.replace(/@import\s+[^;]+;/gi, '');
  
  // Remove expression() (IE specific)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');
  
  // Remove javascript: in url()
  sanitized = sanitized.replace(/url\s*\(\s*javascript:[^)]*\)/gi, '');
  
  return sanitized;
}
