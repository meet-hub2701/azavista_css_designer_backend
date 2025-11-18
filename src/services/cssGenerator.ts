import type { Theme } from '../../../shared/src/types';

export function generateCSS(theme: Theme): string {
  const { cssOverrides } = theme;
  
  if (!cssOverrides) {
    return '/* No CSS overrides defined */';
  }

  const { buttons, typography, spacing, background, borders, effects, customCSS } = cssOverrides;
  
  const fontWeightMap: Record<string, number> = {
    'Thin': 100,
    'ExtraLight': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'SemiBold': 600,
    'Bold': 700,
    'ExtraBold': 800,
    'Black': 900,
  };

  return `
/* StyleForge Theme: ${theme.name} */
/* Generated: ${new Date().toISOString()} */

/* Body & Background */
body {
  background-color: ${background.bodyBackground} !important;
  font-family: ${typography.body.fontFamily}, sans-serif !important;
  font-size: ${typography.body.fontSize}px !important;
  color: ${typography.body.color} !important;
  line-height: ${typography.body.lineHeight} !important;
  letter-spacing: ${typography.body.letterSpacing}px !important;
  font-weight: ${fontWeightMap[typography.body.fontWeight] || 400} !important;
}

/* Typography */
h1, .h1 {
  font-family: ${typography.h1.fontFamily}, sans-serif !important;
  font-size: ${typography.h1.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h1.fontWeight] || 700} !important;
  color: ${typography.h1.color} !important;
  line-height: ${typography.h1.lineHeight} !important;
  letter-spacing: ${typography.h1.letterSpacing}px !important;
}

h2, .h2 {
  font-family: ${typography.h2.fontFamily}, sans-serif !important;
  font-size: ${typography.h2.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h2.fontWeight] || 700} !important;
  color: ${typography.h2.color} !important;
  line-height: ${typography.h2.lineHeight} !important;
  letter-spacing: ${typography.h2.letterSpacing}px !important;
}

h3, .h3 {
  font-family: ${typography.h3.fontFamily}, sans-serif !important;
  font-size: ${typography.h3.fontSize}px !important;
  font-weight: ${fontWeightMap[typography.h3.fontWeight] || 600} !important;
  color: ${typography.h3.color} !important;
  line-height: ${typography.h3.lineHeight} !important;
  letter-spacing: ${typography.h3.letterSpacing}px !important;
}

/* Primary Buttons */
button, .btn, .button, input[type="submit"], input[type="button"] {
  background-color: ${buttons.primary.backgroundColor} !important;
  color: ${buttons.primary.textColor} !important;
  border-radius: ${buttons.primary.borderRadius}px !important;
  border: ${buttons.primary.borderWidth}px solid ${buttons.primary.borderColor} !important;
  font-size: ${buttons.primary.fontSize}px !important;
  font-weight: ${fontWeightMap[buttons.primary.fontWeight] || 400} !important;
  font-family: ${buttons.primary.fontFamily}, sans-serif !important;
  padding: ${buttons.primary.paddingY}px ${buttons.primary.paddingX}px !important;
  box-shadow: ${effects.buttonShadow} !important;
  transition: all ${effects.transitionDuration}ms ease !important;
  cursor: pointer !important;
}

button:hover, .btn:hover, .button:hover {
  transform: ${effects.hoverTransform} !important;
}

/* Secondary Buttons */
.btn-secondary, .button-secondary {
  background-color: ${buttons.secondary.backgroundColor} !important;
  color: ${buttons.secondary.textColor} !important;
  border: ${buttons.secondary.borderWidth}px solid ${buttons.secondary.borderColor} !important;
}

/* Spacing */
.container, .wrapper {
  padding: ${spacing.containerPadding}px !important;
}

section, .section {
  padding: ${spacing.sectionPadding}px 0 !important;
}

/* Backgrounds */
section:nth-child(even), .section-alt {
  background-color: ${background.sectionBackground} !important;
}

/* Cards */
.card, .panel, article {
  background-color: ${background.cardBackground} !important;
  border-radius: ${borders.cardBorderRadius}px !important;
  border: ${borders.cardBorderWidth}px solid ${borders.cardBorderColor} !important;
  box-shadow: ${effects.cardShadow} !important;
  transition: all ${effects.transitionDuration}ms ease !important;
}

.card:hover, .panel:hover, article:hover {
  transform: ${effects.hoverTransform} !important;
}

/* Inputs */
input, textarea, select {
  border-radius: ${borders.inputBorderRadius}px !important;
  border: ${borders.inputBorderWidth}px solid ${borders.inputBorderColor} !important;
  padding: 12px 16px !important;
  font-family: ${typography.body.fontFamily}, sans-serif !important;
  font-size: ${typography.body.fontSize}px !important;
}

input:focus, textarea:focus, select:focus {
  outline: none !important;
  border-color: ${buttons.primary.backgroundColor} !important;
  box-shadow: 0 0 0 3px ${buttons.primary.backgroundColor}33 !important;
}

/* Custom CSS */
${customCSS}
`.trim();
}
