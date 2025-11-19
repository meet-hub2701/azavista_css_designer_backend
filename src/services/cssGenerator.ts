import type { Theme, Section } from '../../../shared/src/types';

export function generateCSS(theme: Theme, sections: Section[]): string {
  const { globalStyles } = theme;
  
  if (!sections || sections.length === 0) {
    return '/* No sections defined */';
  }

  let css = `
/* StyleForge Theme: ${theme.name} */
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
    const className = `.section-${section.type}`;
    
    css += `\n/* Section: ${section.name} (${section.type}) */\n`;
    css += `${className} {\n`;
    css += `  background: ${cssProperties.colors.background};\n`;
    css += `  color: ${cssProperties.colors.text};\n`;
    css += `  border: ${cssProperties.borders.width} ${cssProperties.borders.style} ${cssProperties.colors.border};\n`;
    css += `  border-radius: ${cssProperties.borders.radius};\n`;
    css += `  padding: ${cssProperties.spacing.padding};\n`;
    css += `  margin: ${cssProperties.spacing.margin};\n`;
    css += `  font-size: ${cssProperties.typography.fontSize};\n`;
    css += `  font-weight: ${cssProperties.typography.fontWeight};\n`;
    css += `  line-height: ${cssProperties.typography.lineHeight};\n`;
    css += `  box-shadow: ${cssProperties.effects.shadow};\n`;
    css += `  transition: ${cssProperties.effects.transition};\n`;
    css += `}\n`;
    
    if (customCSS) {
      css += `\n${customCSS}\n`;
    }
  });
  
  return css.trim();
}
