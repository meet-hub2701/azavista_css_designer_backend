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
      enum: ['header', 'footer', 'card', 'button', 'form', 'navigation', 'hero', 'content', 'custom'],
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
      },
      spacing: {
        padding: String,
        margin: String,
        gap: String,
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
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    previewComponent: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
SectionSchema.index({ themeId: 1, order: 1 });

export default mongoose.model<SectionDocument>('Section', SectionSchema);
