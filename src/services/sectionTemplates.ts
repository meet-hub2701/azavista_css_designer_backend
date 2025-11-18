import type { SectionType, SectionCSSProperties } from '../../../shared/src/types';

export const sectionTemplates: Record<SectionType, SectionCSSProperties> = {
  header: {
    colors: {
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6',
      hover: '#007bff',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '1rem 0',
      margin: '0',
      gap: '1rem',
    },
    borders: {
      radius: '0',
      width: '0 0 1px 0',
      style: 'solid',
    },
    effects: {
      shadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
  },
  
  footer: {
    colors: {
      background: '#f8f9fa',
      text: '#6c757d',
      border: '#dee2e6',
      hover: '#007bff',
    },
    typography: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '2rem 0',
      margin: '0',
      gap: '1rem',
    },
    borders: {
      radius: '0',
      width: '1px 0 0 0',
      style: 'solid',
    },
    effects: {
      shadow: 'none',
      transition: 'all 0.3s ease',
    },
  },
  
  card: {
    colors: {
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6',
      hover: '#f8f9fa',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '1.5rem',
      margin: '1rem 0',
      gap: '1rem',
    },
    borders: {
      radius: '0.375rem',
      width: '1px',
      style: 'solid',
    },
    effects: {
      shadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
      transition: 'all 0.3s ease',
      transform: 'translateY(-2px)',
    },
  },
  
  button: {
    colors: {
      background: '#007bff',
      text: '#ffffff',
      border: '#007bff',
      hover: '#0056b3',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '0.375rem 0.75rem',
      margin: '0',
      gap: '0.5rem',
    },
    borders: {
      radius: '0.375rem',
      width: '1px',
      style: 'solid',
    },
    effects: {
      shadow: 'none',
      transition: 'all 0.15s ease-in-out',
    },
  },
  
  form: {
    colors: {
      background: '#ffffff',
      text: '#495057',
      border: '#ced4da',
      hover: '#80bdff',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '0.375rem 0.75rem',
      margin: '0 0 1rem 0',
      gap: '0.5rem',
    },
    borders: {
      radius: '0.375rem',
      width: '1px',
      style: 'solid',
    },
    effects: {
      shadow: 'none',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    },
  },
  
  navigation: {
    colors: {
      background: '#343a40',
      text: '#ffffff',
      border: 'transparent',
      hover: '#007bff',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '0.5rem 1rem',
      margin: '0',
      gap: '1rem',
    },
    borders: {
      radius: '0',
      width: '0',
      style: 'none',
    },
    effects: {
      shadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
  },
  
  hero: {
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      border: 'transparent',
      hover: '#ffffff',
    },
    typography: {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.5px',
    },
    spacing: {
      padding: '6rem 0',
      margin: '0',
      gap: '2rem',
    },
    borders: {
      radius: '0',
      width: '0',
      style: 'none',
    },
    effects: {
      shadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
  },
  
  content: {
    colors: {
      background: '#ffffff',
      text: '#212529',
      border: 'transparent',
      hover: '#007bff',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0',
    },
    spacing: {
      padding: '2rem 0',
      margin: '0',
      gap: '1rem',
    },
    borders: {
      radius: '0',
      width: '0',
      style: 'none',
    },
    effects: {
      shadow: 'none',
      transition: 'all 0.3s ease',
    },
  },
  
  custom: {
    colors: {
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6',
      hover: '#007bff',
    },
    typography: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    spacing: {
      padding: '1rem',
      margin: '0',
      gap: '1rem',
    },
    borders: {
      radius: '0.375rem',
      width: '1px',
      style: 'solid',
    },
    effects: {
      shadow: 'none',
      transition: 'all 0.3s ease',
    },
  },
};

export function getSectionTemplate(type: SectionType): SectionCSSProperties {
  return sectionTemplates[type];
}
