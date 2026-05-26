import express from "express";
<<<<<<< HEAD
=======

>>>>>>> 8db61718420d4a354702b0b9fa7586c47e330e91
const router = express.Router();

router.post("/chat", async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Thiếu messages" });
  }

  try {
<<<<<<< HEAD
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

   const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log("Calling URL:", url.replace(process.env.GEMINI_API_KEY, "***"));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: system || "" }] },
          { role: "model", parts: [{ text: "Được rồi, tôi hiểu." }] },
          ...contents,
        ],
=======
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
>>>>>>> 8db61718420d4a354702b0b9fa7586c47e330e91
      }),
    });

    const data = await response.json();
<<<<<<< HEAD
    console.log("Gemini data:", JSON.stringify(data).slice(0, 300));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, có lỗi xảy ra!";
    res.json({ content: [{ text }] });

=======

    if (!response.ok) {
      console.error("[Chat] Anthropic lỗi:", data);
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Lỗi Anthropic API" });
    }

    res.json(data);
>>>>>>> 8db61718420d4a354702b0b9fa7586c47e330e91
  } catch (err) {
    console.error("[Chat] Lỗi server:", err.message);
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
=======
// THAY ĐỔI QUAN TRỌNG NHẤT LÀ Ở ĐÂY: Dùng export default
>>>>>>> 8db61718420d4a354702b0b9fa7586c47e330e91
export default router;
