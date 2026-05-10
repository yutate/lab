const express = require("express");
const router = express.Router();
const { googleAgent, metaAgent, youtubeAgent, tiktokAgent } = require("../agents/adcpAgents");

router.post("/agent/google",  (req, res) => res.json(googleAgent(req.body)));
router.post("/agent/meta",    (req, res) => res.json(metaAgent(req.body)));
router.post("/agent/youtube", (req, res) => res.json(youtubeAgent(req.body)));
router.post("/agent/tiktok",  (req, res) => res.json(tiktokAgent(req.body)));

module.exports = router;
