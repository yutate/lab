const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*", methods: ["GET","POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

/* ============================================================
   共通ユーティリティ
   ============================================================ */

function yen(value) {
  return "¥" + Number(Math.round(value)).toLocaleString("ja-JP");
}

function addNoise(value, rate = 0.08) {
  const noise = 1 + (Math.random() * rate * 2 - rate);
  return Math.round(value * noise);
}

function pressureMultiplier(pct, threshold, penalty) {
  if (pct <= threshold) return 1;
  return 1 + ((pct - threshold) / 10) * penalty;
}

function getIntentType(req) {
  return req.body.intent_type || "balanced";
}

function getTargetCPA(req) {
  const kpi = req.body.brief?.kpi || [];
  const cpa = kpi.find(k => /CPA/i.test(k.metric || ""));
  if (!cpa) return null;
  const num = Number(String(cpa.target).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function getTargetAge(req) {
  return req.body.brief?.target_audience?.age_range || null;
}

function getObjective(req) {
  return req.body.brief?.objective || req.body.objective || null;
}

function getPct(req) {
  return Number(req.body.allocation_pct || 0);
}

function isYouthAudience(req) {
  return /20|Z世代|Gen\s?Z|GenZ|若年/i.test(getTargetAge(req) || "");
}

function cpaStatus(cpa, targetCPA) {
  if (!targetCPA || cpa === null) return "unknown";
  if (cpa <= targetCPA * 0.9) return "well_within";
  if (cpa <= targetCPA) return "within";
  if (cpa <= targetCPA * 1.1) return "slightly_over";
  return "over";
}

function decideAvailability({ pct, cpa, targetCPA, hardLimit, softLimit }) {
  if (pct >= hardLimit) return "limited";
  if (targetCPA && cpa > targetCPA * 1.15) return "limited";
  if (pct >= softLimit) return "caution";
  return "available";
}

function commonResponseBase(req, agent, channel, pct) {
  return {
    agent,
    channel,
    allocation_pct: pct,
    request_context: {
      intent_type: getIntentType(req),
      objective: getObjective(req),
      target_cpa: getTargetCPA(req),
      age_range: getTargetAge(req),
    },
  };
}

/* ============================================================
   Google Agent
   ============================================================ */
app.post("/agent/google", (req, res) => {
  const pct = getPct(req);
  const intent = getIntentType(req);
  const targetCPA = getTargetCPA(req);

  let cpa = 7600;
  if (intent === "conversion_like") cpa *= 0.95;
  if (intent === "learning") cpa *= 1.08;
  if (intent === "impulse") cpa *= 1.06;

  cpa *= pressureMultiplier(pct, 35, 0.08);
  cpa = addNoise(cpa, 0.05);

  const availability = decideAvailability({
    pct, cpa, targetCPA,
    hardLimit: 50, softLimit: 42,
  });

  let suggested_allocation;
  if (pct < 30) {
    suggested_allocation = 32;
  } else if (intent === "conversion_like") {
    suggested_allocation = Math.min(pct, 45);
  } else if (intent === "learning" || intent === "impulse") {
    suggested_allocation = Math.min(pct, 30);
  } else {
    suggested_allocation = Math.min(pct, 40);
  }

  const status = cpaStatus(cpa, targetCPA);

  res.json({
    ...commonResponseBase(req, "Google", "Search", pct),
    availability,
    estimated_cpa: yen(cpa),
    estimated_cpa_raw: cpa,
    estimated_reach: Math.round(300000 * (pct / 100) * (1 - pct / 200)),
    agent_intent: "capture_high_intent_demand",
    suggested_allocation,
    suggested_role: "conversion_capture",
    required_creative: ["responsive_search_ad", "dynamic_keyword_insertion"],
    constraints: {
      min_allocation: 15,
      max_allocation: 50,
      learning_period_days: 7,
    },
    risk: pct > 40
      ? "Search demand saturation — CPA degradation likely beyond 40%"
      : "Low risk within demand ceiling",
    negotiation_note: "Scale until search demand saturates",
    recommendation: status === "over"
      ? "Reduce allocation to ease CPA pressure"
      : "Prioritise for conversion capture; expand if CPA holds",
    cpa_status: status,
  });
});

/* ============================================================
   Meta Agent
   ============================================================ */
app.post("/agent/meta", (req, res) => {
  const pct = getPct(req);
  const intent = getIntentType(req);
  const targetCPA = getTargetCPA(req);

  let cpa = 8400;
  if (intent === "comparison" || intent === "impulse") cpa *= 0.94;
  if (intent === "conversion_like") cpa *= 1.04;

  cpa *= pressureMultiplier(pct, 32, 0.07);
  cpa = addNoise(cpa, 0.08);

  const availability = decideAvailability({
    pct, cpa, targetCPA,
    hardLimit: 42, softLimit: 36,
  });

  let suggested_allocation;
  if (intent === "impulse") {
    suggested_allocation = Math.min(Math.max(pct, 30), 36);
  } else if (intent === "learning") {
    suggested_allocation = Math.min(Math.max(pct, 24), 30);
  } else {
    suggested_allocation = Math.min(Math.max(pct, 25), 32);
  }

  const status = cpaStatus(cpa, targetCPA);

  res.json({
    ...commonResponseBase(req, "Meta", "Instagram/Facebook", pct),
    availability,
    estimated_cpa: yen(cpa),
    estimated_cpa_raw: cpa,
    estimated_reach: Math.round(500000 * (pct / 100) * (1 - pct / 180)),
    agent_intent: "own_consideration_and_retargeting",
    suggested_allocation,
    suggested_role: "consideration_and_retargeting",
    required_creative: ["carousel", "single_image", "short_video_15s"],
    constraints: {
      min_allocation: 15,
      max_allocation: 42,
      learning_period_days: 14,
    },
    risk: pct > 35
      ? "Creative fatigue risk — frequency cap and rotation required"
      : "Stable within learning budget range",
    negotiation_note: "Needs stable learning budget",
    recommendation: status === "over"
      ? "Hold allocation; refresh creatives to recover CPA"
      : "Maintain for retargeting; increase if CV rate supports",
    cpa_status: status,
  });
});

/* ============================================================
   YouTube Agent
   ============================================================ */
app.post("/agent/youtube", (req, res) => {
  const pct = getPct(req);
  const intent = getIntentType(req);
  const targetCPA = getTargetCPA(req);

  let cpa = 8800;
  if (intent === "learning") cpa *= 0.92;
  if (intent === "comparison") cpa *= 1.04;
  if (intent === "conversion_like") cpa *= 1.10;

  cpa *= pressureMultiplier(pct, 18, 0.10);
  cpa = addNoise(cpa, 0.10);

  // learningかつpct<=30ならavailable強制維持
  let availability;
  if (intent === "learning" && pct <= 30) {
    availability = "available";
  } else {
    availability = decideAvailability({
      pct, cpa, targetCPA,
      hardLimit: 32, softLimit: 24,
    });
  }

  const suggested_allocation_map = {
    learning: 24,
    comparison: 16,
    conversion_like: 12,
    impulse: 10,
  };
  const suggested_allocation = suggested_allocation_map[intent] ?? 15;

  const suggested_role = intent === "learning"
    ? "education_and_understanding"
    : "comparison_support";

  const status = cpaStatus(cpa, targetCPA);

  res.json({
    ...commonResponseBase(req, "YouTube", "Video", pct),
    availability,
    estimated_cpa: yen(cpa),
    estimated_cpa_raw: cpa,
    estimated_reach: Math.round(800000 * (pct / 100) * (1 - pct / 150)),
    agent_intent: "protect_upper_funnel_role",
    suggested_allocation,
    suggested_role,
    required_creative: ["skippable_instream_30s", "bumper_6s"],
    constraints: {
      min_allocation: 5,
      max_allocation: 32,
      learning_period_days: 10,
    },
    risk: pct > 25
      ? "Last-click CPA will look inflated — VTR and brand lift metrics needed"
      : "Appropriate for upper-funnel support role",
    negotiation_note: "Not for pure CV; supports understanding and comparison",
    recommendation: intent === "conversion_like"
      ? "Reduce YouTube and reallocate to Google/Meta for CV efficiency"
      : "Use for brand education; pair with downstream CV channel",
    cpa_status: status,
  });
});

/* ============================================================
   TikTok Agent
   ============================================================ */
app.post("/agent/tiktok", (req, res) => {
  const pct = getPct(req);
  const intent = getIntentType(req);
  const targetCPA = getTargetCPA(req);
  const youth = isYouthAudience(req);

  // CPAは基本volatile、conversion_like + pct>20では数値を出す
  let cpaRaw = null;
  let estimatedCpa = "volatile";
  if (intent === "conversion_like" && pct > 20) {
    cpaRaw = addNoise(11000, 0.15);
    estimatedCpa = yen(cpaRaw);
  }

  // availability
  let availability;
  if (youth) {
    availability = pct >= 25 && intent !== "impulse" ? "limited" : "available";
  } else {
    availability = pct >= 18 ? "limited" : "available";
  }

  const suggested_allocation_map = {
    impulse: youth ? 28 : 22,
    learning: 16,
    comparison: 18,
    conversion_like: 14,
  };
  const suggested_allocation = suggested_allocation_map[intent] ?? (youth ? 22 : 16);

  const status = cpaStatus(cpaRaw, targetCPA);

  res.json({
    ...commonResponseBase(req, "TikTok", "Short Video", pct),
    availability,
    estimated_cpa: estimatedCpa,
    estimated_cpa_raw: cpaRaw,
    estimated_reach: Math.round(1200000 * (pct / 100) * (youth ? 1.3 : 0.9)),
    agent_intent: "maximize_discovery_with_creative_learning",
    suggested_allocation,
    suggested_role: "discovery_and_creative_test",
    required_creative: ["ugc_style_15s", "trending_audio_hook"],
    constraints: {
      min_allocation: 5,
      max_allocation: youth ? 28 : 20,
      learning_period_days: 14,
    },
    risk: intent === "conversion_like"
      ? "CPA highly volatile; avoid large CV-focused allocation"
      : "Creative quality is the primary performance lever",
    negotiation_note: "Creative-dependent channel; test budget only unless impulse/youth",
    recommendation: youth && intent === "impulse"
      ? "Strong fit — scale with UGC-style creatives and trending hooks"
      : "Keep as test budget; do not anchor KPI on last-click CPA",
    cpa_status: status,
  });
});

/* ============================================================
   Health
   ============================================================ */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AdCP Mock Seller Agents",
    version: "v1.1",
    endpoints: [
      "/agent/google",
      "/agent/meta",
      "/agent/youtube",
      "/agent/tiktok",
    ],
  });
});

/* ============================================================
   起動
   ============================================================ */
app.listen(3000, () => {
  console.log("AdCP Negotiation Mock Agents v1.1 running → http://127.0.0.1:3000");
});
