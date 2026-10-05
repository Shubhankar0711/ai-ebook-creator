const { generateAI } = require('../utils/aiProvider');
const Book = require('../models/Book.model');
const Chapter = require('../models/Chapter.model');

// Helper to enforce server-side input size limits on AI prompts
const validateInputLength = (text, maxLength, name = 'Input') => {
  if (text && typeof text === 'string' && text.length > maxLength) {
    throw new Error(`${name} exceeds maximum allowed length of ${maxLength} characters.`);
  }
};

// @desc Generate book description
// @route POST /api/ai/generate-description
const generateDescription = async (req, res) => {
  try {
    const { title, genre, tone, language = 'English' } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    validateInputLength(title, 200, 'Title');

    const prompt = `You are a professional book copywriter. Write a concise, 2-to-3 sentence compelling book description for a ${genre || 'general'} book titled "${title}".
Tone: ${tone || 'professional'}
Language: ${language}

Output ONLY the direct book description text. Do NOT include any conversational introduction, preamble, titles, quotation marks, or meta text.`;

    const raw = await generateAI(prompt, 300);
    const description = raw
      .replace(/^(Here (is|are)|Sure|Certainly|Certainly!|Book description)[^:\n]*:\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    res.json({ success: true, description });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Description generation failed' });
  }
};

// @desc Generate book outline
// @route POST /api/ai/generate-outline
const generateOutline = async (req, res) => {
  try {
    const { bookId, title, genre, tone, targetAudience, language, numberOfChapters = 10, description } = req.body;

    if (bookId) {
      const book = await Book.findOne({ _id: bookId, owner: req.user._id });
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
      }
    }

    const prompt = `You are a professional author and book writing assistant.

Create a detailed book outline for:
Title: "${title}"
Genre: ${genre}
Tone: ${tone}
Target Audience: ${targetAudience}
Language: ${language}
Number of Chapters: ${numberOfChapters}
${description ? `Description: ${description}` : ''}

Provide a comprehensive outline including:
1. A compelling book synopsis (2-3 paragraphs)
2. Main themes and key messages
3. Chapter-by-chapter outline with:
   - Chapter title
   - Brief description (2-3 sentences)
   - Key points covered

Format it clearly and professionally. Write in ${language}.`;

    const outline = await generateAI(prompt, 3000);

    if (bookId) {
      await Book.findOneAndUpdate({ _id: bookId, owner: req.user._id }, { outline });
    }

    res.json({ success: true, outline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Generate chapter content
// @route POST /api/ai/generate-chapter
const generateChapter = async (req, res) => {
  try {
    const { chapterId, bookId, chapterTitle, chapterNumber, bookTitle, genre, tone, language, outline, previousChapterSummary } = req.body;

    if (bookId) {
      const book = await Book.findOne({ _id: bookId, owner: req.user._id });
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
      }
    }

    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      if (chapter) {
        const bookObj = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
        if (!bookObj) {
          return res.status(403).json({ success: false, message: 'Unauthorized chapter access' });
        }
      }
    }

    const prompt = `You are a professional author writing a ${genre || 'general'} book titled "${bookTitle || 'Untitled'}".

Write Chapter ${chapterNumber || 1}: "${chapterTitle || 'Chapter Title'}"

Book details:
- Genre: ${genre || 'General'}
- Tone: ${tone || 'Professional'}  
- Language: ${language || 'English'}
${outline ? `- Book Outline: ${outline.substring(0, 500)}...` : ''}
${previousChapterSummary ? `- Previous chapter summary: ${previousChapterSummary}` : ''}

Write a complete, engaging chapter with:
- A compelling opening
- Well-developed content with vivid details
- Natural dialogue (if applicable)
- Strong narrative flow
- A satisfying chapter ending

Target length: 800-1200 words. Write in ${language || 'English'} with a ${tone || 'professional'} tone.`;

    const content = await generateAI(prompt, 2500);

    if (chapterId) {
      await Chapter.findByIdAndUpdate(chapterId, { content, isGenerated: true });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Rewrite content
// @route POST /api/ai/rewrite
const rewriteContent = async (req, res) => {
  try {
    const { content, tone, style, language = 'English' } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const prompt = `Rewrite the following text with a ${tone || 'professional'} tone${style ? ` in a ${style} style` : ''}. 
Maintain the core meaning but improve the writing quality, flow, and engagement.
Write in ${language}.

Original text:
${content}

Rewritten version:`;

    const rewritten = await generateAI(prompt, 2000);
    res.json({ success: true, content: rewritten });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Expand paragraph
// @route POST /api/ai/expand
const expandContent = async (req, res) => {
  try {
    const { content, language = 'English', context } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const prompt = `Expand and elaborate on the following paragraph. Add more detail, examples, and depth while maintaining the original tone and message. 
${context ? `Context: ${context}` : ''}
Write in ${language}.

Original:
${content}

Expanded version (aim for 2-3x the original length):`;

    const expanded = await generateAI(prompt, 1500);
    res.json({ success: true, content: expanded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Shorten/summarize content
// @route POST /api/ai/summarize
const summarizeContent = async (req, res) => {
  try {
    const { content, language = 'English', type = 'summary' } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const instruction = type === 'shorten'
      ? 'Shorten this text to about half its length while preserving all key points and the original tone.'
      : 'Write a concise summary capturing the main points and key insights.';

    const prompt = `${instruction}
Write in ${language}.

Text:
${content}

${type === 'shorten' ? 'Shortened version' : 'Summary'}:`;

    const result = await generateAI(prompt, 1000);
    res.json({ success: true, content: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Improve grammar
// @route POST /api/ai/improve-grammar
const improveGrammar = async (req, res) => {
  try {
    const { content, language = 'English' } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const prompt = `Fix all grammar, spelling, punctuation, and style issues in the following text. 
Improve clarity and readability while preserving the original meaning and voice.
Write in ${language}.

Text to improve:
${content}

Improved version:`;

    const improved = await generateAI(prompt, 2000);
    res.json({ success: true, content: improved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Continue writing
// @route POST /api/ai/continue
const continueWriting = async (req, res) => {
  try {
    const { content, bookTitle, genre, tone, language = 'English' } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const prompt = `Continue writing the following text naturally. Match the existing tone, style, and narrative voice perfectly.
${bookTitle ? `Book: "${bookTitle}"` : ''}
${genre ? `Genre: ${genre}` : ''}
${tone ? `Tone: ${tone}` : ''}
Write in ${language}. Add approximately 300-500 words.

Existing text (continue from the end):
${content.slice(-800)}

Continue:`;

    const continuation = await generateAI(prompt, 1000);
    res.json({ success: true, content: continuation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Generate book titles
// @route POST /api/ai/generate-titles
const generateTitles = async (req, res) => {
  try {
    const { genre, description, tone, language = 'English' } = req.body;

    const prompt = `Generate 10 creative, compelling book titles for:
Genre: ${genre || 'general'}
${description ? `Description: ${description}` : ''}
${tone ? `Tone: ${tone}` : ''}
Language: ${language}

Provide titles that are:
- Memorable and engaging
- Appropriate for the genre
- Varied in style

Format as a numbered list. Output ONLY the numbered titles list.`;

    const raw = await generateAI(prompt, 500);
    const titles = raw.replace(/^(Here (is|are)|Sure|Certainly)[^:\n]*:\s*/i, '').trim();

    res.json({ success: true, titles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

// @desc Generate book cover prompt (for AI image generation)
// @route POST /api/ai/generate-cover-prompt
const generateCoverPrompt = async (req, res) => {
  try {
    const { title, genre, description, tone } = req.body;

    const prompt = `Create a detailed image generation prompt for a book cover for:
Title: "${title}"
Genre: ${genre}
${description ? `Description: ${description}` : ''}
${tone ? `Tone: ${tone}` : ''}

Write a vivid, detailed prompt suitable for an AI image generator (like DALL-E or Midjourney) that would create a professional, eye-catching book cover. Include style, mood, colors, and visual elements.`;

    const coverPrompt = await generateAI(prompt, 300);
    res.json({ success: true, coverPrompt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
  }
};

module.exports = {
  generateDescription,
  generateOutline,
  generateChapter,
  rewriteContent,
  expandContent,
  summarizeContent,
  improveGrammar,
  continueWriting,
  generateTitles,
  generateCoverPrompt,
};
