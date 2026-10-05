const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    default: ''
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  genre: {
    type: String,
    enum: ['fiction', 'non-fiction', 'self-help', 'business', 'technology', 'science', 'history', 'biography', 'fantasy', 'romance', 'mystery', 'thriller', 'education', 'children', 'poetry', 'other'],
    default: 'other',
    set: v => (v || 'other').toLowerCase().trim()
  },
  language: {
    type: String,
    default: 'English'
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'academic', 'conversational', 'inspirational', 'humorous', 'formal', 'creative'],
    default: 'professional',
    set: v => (v || 'professional').toLowerCase().trim()
  },
  targetAudience: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  themeColor: {
    type: String,
    default: 'purple'
  },
  template: {
    type: String,
    default: 'purple'
  },
  outline: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'published'],
    default: 'draft'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    default: ''
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  wordCount: {
    type: Number,
    default: 0
  },
  chapterCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number,
    default: 0
  },
  tags: [{ type: String }],
  versions: [{
    content: String,
    savedAt: { type: Date, default: Date.now },
    label: String
  }]
}, { timestamps: true });

// Indexes for search and query performance
bookSchema.index({ title: 'text', description: 'text', author: 'text' });
bookSchema.index({ owner: 1, createdAt: -1 });
bookSchema.index({ owner: 1, isFavorite: 1 });
bookSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Book', bookSchema);
