import express from "express";
import { getRestaurantContext } from "./restaurantContext.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Thiếu messages" });
  }

  try {
    // Lấy context nhà hàng từ DB (có cache 5 phút)
    const systemPrompt = await getRestaurantContext();

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log("Calling URL:", url.replace(process.env.GEMINI_API_KEY, "***"));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: contents,
      }),
    });

    const data = await response.json();
    console.log("Gemini data:", JSON.stringify(data).slice(0, 400));

    if (!response.ok) {
      console.error("[Chat] Gemini error:", response.status, data);
      return res
        .status(500)
        .json({
          error: data.error?.message || `Gemini lỗi ${response.status}`,
        });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("[Chat] Gemini missing candidate:", JSON.stringify(data));
      return res
        .status(500)
        .json({ error: "Không nhận được phản hồi hợp lệ từ Gemini" });
    }

    res.json({ content: [{ text }] });
  } catch (err) {
    console.error("[Chat] Lỗi server:", err);
    res.status(500).json({ error: err.message || "Lỗi server" });
  }
});

export default router;
