const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [200, 'Chapter title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: ''
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number,
    default: 0
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  versions: [{
    content: String,
    savedAt: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['empty', 'draft', 'complete'],
    default: 'empty'
  }
}, { timestamps: true });

// Pre-save: calculate word count and reading time
chapterSchema.pre('save', function () {
  const content = this.content || '';
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  this.wordCount = words.length;
  this.readingTime = Math.ceil(words.length / 200); // 200 WPM average
  this.status = words.length > 0 ? 'draft' : 'empty';
});

chapterSchema.index({ bookId: 1, chapterNumber: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
