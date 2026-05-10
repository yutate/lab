const express = require("express");
const router = express.Router();
const { runDebate } = require("../agents/mbtiAgents");

router.post("/debate", async (req, res) => {
  const { topic, participants, round = 1, history = [] } = req.body;
  if (!topic || !participants || participants.length < 2) {
    return res.status(400).json({ error: "topic と participants（2タイプ以上）が必要です" });
  }
  try {
    const result = await runDebate({ topic, participants, round, history });
    res.json(result);
  } catch (e) {
    console.error('MBTI debate error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
