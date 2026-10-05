const Book = require('../models/Book.model');
const Chapter = require('../models/Chapter.model');
const { generateBookPDF } = require('../utils/pdfGenerator');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

// @desc Export book as PDF
// @route POST /api/export/pdf/:bookId
const exportPDF = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const chapters = await Chapter.find({ bookId: book._id }).sort('chapterNumber');

    const themeColor = req.body.themeColor || req.query.themeColor || book.themeColor || 'purple';
    const pdfBytes = await generateBookPDF(book, chapters, { themeColor });

    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
      'Content-Length': pdfBytes.length,
    });
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Export book as plain text
// @route GET /api/export/txt/:bookId
const exportTXT = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const chapters = await Chapter.find({ bookId: book._id }).sort('chapterNumber');

    let content = `${book.title}\n`;
    if (book.subtitle) content += `${book.subtitle}\n`;
    content += `by ${book.author || 'Unknown'}\n`;
    content += '='.repeat(60) + '\n\n';

    for (const chapter of chapters) {
      content += `\nChapter ${chapter.chapterNumber}: ${chapter.title}\n`;
      content += '-'.repeat(40) + '\n\n';
      const stripped = (chapter.content || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      content += stripped + '\n\n';
    }

    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${safeTitle}.txt"`,
    });
    res.send(content);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to strip HTML tags and convert lines to docx Paragraphs
const htmlToDocxParagraphs = (htmlContent) => {
  if (!htmlContent) return [new Paragraph({ text: '' })];

  // Remove standard HTML tags and clean whitespace
  const cleanText = htmlContent
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const lines = cleanText.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length === 0) return [new Paragraph({ text: '' })];

  return lines.map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line.trim(),
          font: 'Calibri',
          size: 24, // 12pt font
        }),
      ],
      spacing: { after: 120, line: 360 }, // 1.5 line spacing
    });
  });
};

// @desc Export book as genuine DOCX (Pro/Enterprise only)
// @route POST /api/export/docx/:bookId
const exportDOCX = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const chapters = await Chapter.find({ bookId: book._id }).sort('chapterNumber');

    const docSections = [];

    // Title & Metadata Section
    const titleParagraphs = [
      new Paragraph({
        text: book.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ];

    if (book.subtitle) {
      titleParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: book.subtitle,
              italics: true,
              size: 28,
              color: '555555',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    titleParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `By ${book.author || req.user.name || 'Author'}`,
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    // Add Chapters to Document
    const bodyParagraphs = [];

    for (const chapter of chapters) {
      bodyParagraphs.push(
        new Paragraph({
          text: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const contentParagraphs = htmlToDocxParagraphs(chapter.content);
      bodyParagraphs.push(...contentParagraphs);
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [...titleParagraphs, ...bodyParagraphs],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error('DOCX Export Error:', error);
    res.status(500).json({ success: false, message: error.message || 'DOCX export failed' });
  }
};

module.exports = { exportPDF, exportTXT, exportDOCX };
