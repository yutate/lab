const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use("/adcp", require("./routes/adcp"));
app.use("/mbti", require("./routes/mbti"));

// ── Health ──
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Lab Mock Agent Server",
    version: "v2.0",
    routes: {
      adcp: ["/adcp/agent/google", "/adcp/agent/meta", "/adcp/agent/youtube", "/adcp/agent/tiktok"],
      mbti: ["/mbti/debate"],
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lab Mock Agent Server v2.0 running → http://127.0.0.1:${PORT}`);
});
