import express from "express";
const router = express.Router();

router.post("/chat", async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Thiếu messages" });
  }

  try {
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
      }),
    });

    const data = await response.json();
    console.log("Gemini data:", JSON.stringify(data).slice(0, 300));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, có lỗi xảy ra!";
    res.json({ content: [{ text }] });

  } catch (err) {
    console.error("[Chat] Lỗi server:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
