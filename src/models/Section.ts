import mongoose, { Schema, Document } from 'mongoose';
import type { Section as ISection } from '../shared-types';

export interface SectionDocument extends Omit<ISection, '_id'>, Document {}

const SectionSchema = new Schema<SectionDocument>(
  {
    themeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['header', 'footer', 'card', 'button', 'form', 'navigation', 'hero', 'content', 'custom', 'cta', 'testimonials', 'pricing', 'contact', 'features'],
    },
    cssProperties: {
      colors: {
        background: String,
        text: String,
        border: String,
        hover: String,
        accent: String,
      },
      typography: {
        fontSize: String,
        fontWeight: String,
        fontFamily: String,
        lineHeight: String,
        letterSpacing: String,
        color: String,
        textTransform: String,
        textDecoration: String,
        tags: { type: Map, of: Object }, // Stores Record<string, TypographyStyle>
      },
      spacing: {
        padding: String,
        margin: String,
        gap: String,
        paddingValues: {
          top: String,
          right: String,
          bottom: String,
          left: String,
        },
        marginValues: {
          top: String,
          right: String,
          bottom: String,
          left: String,
        },
        pageWidth: String,
      },
      borders: {
        radius: String,
        width: String,
        style: String,
        color: String,
      },
      effects: {
        shadow: String,
        transition: String,
        transform: String,
        opacity: String,
      },
    },
    customCSS: { type: String, default: '' },
    htmlContent: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    previewComponent: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
SectionSchema.index({ themeId: 1, order: 1 });

export default mongoose.model<SectionDocument>('Section', SectionSchema);
