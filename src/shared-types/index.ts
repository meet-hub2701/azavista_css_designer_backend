// Section-based Theme Builder Types

export interface Theme {
  _id?: string;
  name: string;
  description?: string;
  sourceUrl?: string;
  extractedHtml?: string;
  extractedCss?: string;
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

export interface SectionCSSProperties {
  colors: {
    background: string;
    text: string;
    border: string;
    hover: string;
    accent?: string;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    fontFamily?: string;
    lineHeight: string;
    letterSpacing: string;
  };
  spacing: {
    padding: string;
    margin: string;
    gap: string;
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
