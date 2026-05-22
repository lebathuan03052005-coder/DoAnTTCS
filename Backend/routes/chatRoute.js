const express = require("express");
const router  = express.Router();

router.post("/chat", async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Thiếu messages" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system || "",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Chat] Anthropic lỗi:", data);
      return res.status(response.status).json({ error: data.error?.message || "Lỗi Anthropic API" });
    }

    res.json(data);
  } catch (err) {
    console.error("[Chat] Lỗi server:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
