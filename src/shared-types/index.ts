// Section-based Theme Builder Types

export interface Theme {
  _id?: string;
  name: string;
  description?: string;
  sourceUrl?: string;
  extractedHtml?: string;
  extractedCss?: string;
  extractedFonts?: string[];
  extractedColors?: string[];
  sections: Section[];
  globalStyles: GlobalStyles;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Section {
  _id?: string;
  themeId: string;
  name: string;
  type: SectionType;
  cssProperties: SectionCSSProperties;
  customCSS?: string;
  htmlContent?: string;
  order: number;
  isActive: boolean;
  previewComponent?: string;
}

export type SectionType = 
  | 'header' 
  | 'footer' 
  | 'card' 
  | 'button' 
  | 'form' 
  | 'navigation' 
  | 'hero' 
  | 'content'
  | 'custom';

export interface GlobalStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  baseFontSize: string;
  backgroundColor: string;
  textColor: string;
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: string;
  fontFamily?: string;
  lineHeight: string;
  letterSpacing: string;
  color?: string;
  textTransform?: string;
  textDecoration?: string;
}

export interface BoxModel {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface SectionCSSProperties {
  colors: {
    background: string;
    text: string;
    border: string;
    hover: string;
    accent?: string;
  };
  // Typography can now be a single style (legacy) or a map of tags (h1, h2, p, etc.)
  typography: TypographyStyle & {
    tags?: Record<string, TypographyStyle>;
  };
  spacing: {
    padding: string; // Legacy/Simple
    margin: string;  // Legacy/Simple
    gap: string;
    // Advanced Box Model
    paddingValues?: BoxModel;
    marginValues?: BoxModel;
    pageWidth?: string;
  };
  borders: {
    radius: string;
    width: string;
    style: string;
    color?: string;
  };
  effects: {
    shadow: string;
    transition: string;
    transform?: string;
    opacity?: string;
  };
}



export interface WebsiteAnalysis {
  url: string;
  elements: ElementMap;
  screenshot?: string;
  analyzedAt: Date;
}

export interface ElementMap {
  headers: string[];
  buttons: string[];
  forms: string[];
  navigation: string[];
  cards: string[];
}

// Export formats
export interface ThemeExportCSS {
  themeId: string;
  themeName: string;
  css: string;
  generatedAt: Date;
}

export interface ThemeExportJSON {
  theme: Theme;
  sections: Section[];
  exportedAt: Date;
  version: string;
}

// Section Template System
export type SectionCategory = 
  | 'hero' 
  | 'header' 
  | 'footer' 
  | 'cta' 
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'contact'
  | 'content';

export type InjectionMethod = 'prepend' | 'append' | 'replace' | 'before' | 'after';

export interface SectionTemplate {
  _id?: string;
  name: string;
  category: SectionCategory;
  description?: string;
  htmlTemplate: string;
  defaultStyles: string;
  thumbnail?: string;
  configurableProps: string[];
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InjectionConfig {
  targetSelector: string;
  method: InjectionMethod;
  orderIndex: number;
  breakpoints?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
}

export interface UserSection {
  _id?: string;
  userId?: string;
  templateId: string;
  name: string;
  htmlContent: string;
  cssContent: string;
  customizations: Record<string, any>;
  injectionConfig?: InjectionConfig;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InjectionPoint {
  selector: string;
  label: string;
  description: string;
  elementType: string;
  position: 'top' | 'middle' | 'bottom';
}
