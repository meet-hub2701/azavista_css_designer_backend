import type { ThemeDocument } from '../models/Theme';
import type { SectionDocument } from '../models/Section';
import type { ThemeExportCSS, ThemeExportJSON } from '../../../shared/src/types';

export function exportThemeAsCSS(theme: ThemeDocument, sections: SectionDocument[]): string {
  const { globalStyles } = theme;
  
  let css = `
/* Theme: ${theme.name} */
/* Generated: ${new Date().toISOString()} */

:root {
  --primary-color: ${globalStyles.primaryColor};
  --secondary-color: ${globalStyles.secondaryColor};
  --font-family: ${globalStyles.fontFamily};
  --base-font-size: ${globalStyles.baseFontSize};
  --background-color: ${globalStyles.backgroundColor};
  --text-color: ${globalStyles.textColor};
}

body {
  font-family: var(--font-family);
  font-size: var(--base-font-size);
  background-color: var(--background-color);
  color: var(--text-color);
}
`;

  sections.forEach(section => {
    if (!section.isActive) return;
    
    const { cssProperties, customCSS } = section;
    const className = `.section-${section.type}-${section._id}`;
    
    css += `\n/* Section: ${section.name} (${section.type}) */\n`;
    css += `${className} {\n`;
    css += `  background: ${cssProperties.colors.background};\n`;
    css += `  color: ${cssProperties.colors.text};\n`;
    css += `  border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border};\n`;
    css += `  border-radius: ${cssProperties.borders.radius};\n`;
    css += `  padding: ${cssProperties.spacing.padding};\n`;
    css += `  margin: ${cssProperties.spacing.margin};\n`;
    css += `  gap: ${cssProperties.spacing.gap};\n`;
    css += `  font-size: ${cssProperties.typography.fontSize};\n`;
    css += `  font-weight: ${cssProperties.typography.fontWeight};\n`;
    css += `  line-height: ${cssProperties.typography.lineHeight};\n`;
    css += `  letter-spacing: ${cssProperties.typography.letterSpacing};\n`;
    css += `  box-shadow: ${cssProperties.effects.shadow};\n`;
    css += `  transition: ${cssProperties.effects.transition};\n`;
    css += `}\n`;
    
    css += `${className}:hover {\n`;
    css += `  background: ${cssProperties.colors.hover};\n`;
    if (cssProperties.effects.transform) {
      css += `  transform: ${cssProperties.effects.transform};\n`;
    }
    css += `}\n`;
    
    if (customCSS) {
      css += `\n/* Custom CSS for ${section.name} */\n`;
      css += customCSS + '\n';
    }
  });
  
  return css.trim();
}

export function exportThemeAsJSON(theme: ThemeDocument, sections: SectionDocument[]): ThemeExportJSON {
  return {
    theme: {
      name: theme.name,
      description: theme.description,
      userId: theme.userId,
      sections: [],
      globalStyles: theme.globalStyles,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    },
    sections: sections.map(section => ({
      themeId: section.themeId,
      name: section.name,
      type: section.type,
      cssProperties: section.cssProperties,
      customCSS: section.customCSS,
      order: section.order,
      isActive: section.isActive,
      previewComponent: section.previewComponent,
    })),
    exportedAt: new Date(),
    version: '1.0.0',
  };
}
