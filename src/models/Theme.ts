import mongoose, { Schema, Document } from 'mongoose';
import type { Theme as ITheme } from '../shared-types';

export interface ThemeDocument extends Omit<ITheme, '_id' | 'sections'>, Document {}

const ThemeSchema = new Schema<ThemeDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sourceUrl: { type: String },
    extractedHtml: { type: String },
    extractedCss: { type: String },
    globalStyles: {
      primaryColor: { type: String, default: '#007bff' },
      secondaryColor: { type: String, default: '#6c757d' },
      fontFamily: { type: String, default: 'Arial, sans-serif' },
      baseFontSize: { type: String, default: '16px' },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#212529' },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ThemeDocument>('Theme', ThemeSchema);
