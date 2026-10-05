const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePro, limitAiUsage } = require('../middleware/subscription.middleware');

router.use(protect);
router.use(limitAiUsage);

// Free Plan Accessible
router.post('/generate-titles', generateTitles);
router.post('/generate-description', generateDescription);
router.post('/generate-chapter', generateChapter);

// Pro & Enterprise Only
router.post('/generate-outline', requirePro, generateOutline);
router.post('/generate-cover-prompt', requirePro, generateCoverPrompt);
router.post('/rewrite', requirePro, rewriteContent);
router.post('/expand', requirePro, expandContent);
router.post('/summarize', requirePro, summarizeContent);
router.post('/improve-grammar', requirePro, improveGrammar);
router.post('/continue', requirePro, continueWriting);

module.exports = router;
