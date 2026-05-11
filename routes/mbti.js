const express = require("express");
const router = express.Router();
const { runDebate } = require("../agents/mbtiAgents");
const { runDebateAI } = require("../agents/mbtiAgentsAI");

router.post("/debate", async (req, res) => {
  const { topic, participants, round = 1, history = [], category = 'free', mode = 'rule' } = req.body;

  if (!topic || !participants || participants.length < 2) {
    return res.status(400).json({ error: "topic と participants（2タイプ以上）が必要です" });
  }

  // AIモード
  if (mode === 'ai') {
    try {
      const result = await runDebateAI({ topic, participants, round, history });
      res.json({ ...result, mode: 'ai' });
    } catch (e) {
      console.error('AI debate error:', e.message);
      if (e.message.includes('429') || e.message.includes('quota') || e.message.includes('QUOTA')) {
        return res.status(429).json({ error: 'QUOTA_EXCEEDED' });
      }
      return res.status(500).json({ error: e.message });
    }
    return;
  }

  // ルールベースモード（デフォルト）
  try {
    const result = runDebate({ topic, participants, round, history, category });
    res.json({ ...result, mode: 'rule' });
  } catch (e) {
    console.error('MBTI debate error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
