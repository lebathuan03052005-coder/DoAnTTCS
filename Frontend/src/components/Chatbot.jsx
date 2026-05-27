import { useState, useEffect, useRef, useCallback } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const MENU_API = "http://localhost:5000/api/admin/menu";
const CAT_API = "http://localhost:5000/api/v2/categories";
const AI_API = "http://localhost:5000/api/chat";

const SUGGESTIONS = [
  "🍖 Món nổi bật?",
  "🌶️ Món cay có gì?",
  "💰 Món dưới 200k?",
  "🌿 Món chay?",
  "📋 Đặt bàn như nào?",
];

// ── Format VND ────────────────────────────────────────────────────────────────
const fmt = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

// ── Normalize text (bỏ dấu) ───────────────────────────────────────────────────
const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ── RAG: score món theo query ─────────────────────────────────────────────────
function retrieveItems(query, menuData) {
  if (!menuData.length) return [];
  const q = norm(query);
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  const scored = menuData.map((item) => {
    let score = 0;
    const name = norm(item.item_name);
    const desc = norm(item.description);
    const ingr = norm(item.ingredients);

    if (name.includes(q)) score += 12;
    if (desc.includes(q)) score += 6;
    if (ingr.includes(q)) score += 4;
    words.forEach((w) => {
      if (name.includes(w)) score += 4;
      if (desc.includes(w)) score += 2;
      if (ingr.includes(w)) score += 1;
    });
    const flags = {
      cay: item.is_spicy,
      chay: item.is_vegetarian,
      bestseller: item.is_best_seller,
      "noi bat": item.is_best_seller,
    };
    Object.entries(flags).forEach(([kw, val]) => {
      if (val && q.includes(kw)) score += 8;
    });

    return { ...item, _score: score };
  });

  const relevant = scored
    .filter((i) => i._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);
  return relevant.length ? relevant : menuData.slice(0, 5);
}

// ── Build context string ──────────────────────────────────────────────────────
function buildContext(items, catData) {
  const catMap = {};
  catData.forEach((c) => {
    catMap[c.id] = c.name;
  });
  return items
    .map((item) => {
      const tags = [
        item.is_best_seller && "⭐ Bestseller",
        item.is_spicy && "🌶️ Cay",
        item.is_vegetarian && "🌿 Chay",
      ]
        .filter(Boolean)
        .join(" | ");
      return [
        `Món: ${item.item_name}`,
        `Danh mục: ${catMap[item.category_id] || "–"}`,
        `Giá: ${fmt(item.price)}`,
        `Khẩu phần: ${item.serving_size || "1 người"}`,
        item.description && `Mô tả: ${item.description}`,
        item.ingredients && `Nguyên liệu: ${item.ingredients}`,
        tags && `Đặc điểm: ${tags}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Message({ role, text }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        flexDirection: role === "user" ? "row-reverse" : "row",
        animation: "cbIn .22s ease",
      }}
    >
      {role === "bot" && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#c9a84c,#8a6a1f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
            marginBottom: 2,
          }}
        >
          👑
        </div>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: 16,
          fontSize: 13.5,
          lineHeight: 1.6,
          wordBreak: "break-word",
          borderBottomLeftRadius: role === "bot" ? 4 : 16,
          borderBottomRightRadius: role === "user" ? 4 : 16,
          background:
            role === "user"
              ? "linear-gradient(135deg,#a07830,#c9a84c)"
              : "rgba(255,255,255,0.06)",
          border: role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
          color: role === "user" ? "#0e0c09" : "#e8e0d0",
          fontWeight: role === "user" ? 500 : 400,
        }}
      />
    </div>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#c9a84c,#8a6a1f)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
        }}
      >
        👑
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 14px",
          borderRadius: "16px 16px 16px 4px",
        }}
      >
        {[0, 200, 400].map((d) => (
          <span
            key={d}
            style={{
              width: 6,
              height: 6,
              background: "rgba(201,168,76,0.7)",
              borderRadius: "50%",
              display: "block",
              animation: `cbDot 1.2s ${d}ms ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Chatbot Component ────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const [menuData, setMenuData] = useState([]);
  const [catData, setCatData] = useState([]);
  const historyRef = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          fetch(MENU_API),
          fetch(CAT_API),
        ]);
        const mJson = await mRes.json();
        setMenuData(mJson.data || mJson || []);
        setCatData((await cRes.json()) || []);
      } catch (e) {
        console.warn("[Chatbot] Load data error:", e.message);
      }
    })();
  }, []);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        role: "bot",
        text: "Xin chào! Tôi là trợ lý của **The King Restaurant** 👑\n\nTôi có thể giúp bạn tìm hiểu thực đơn, giá cả, nguyên liệu hoặc gợi ý món ăn. Bạn muốn hỏi gì nào?",
      },
    ]);
  }, []);

  // Badge sau 3s
  useEffect(() => {
    const t = setTimeout(() => {
      if (!open) setShowBadge(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input khi mở
  useEffect(() => {
    if (open) {
      setShowBadge(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const msg = (text || input).trim();
      if (!msg || typing) return;

      setInput("");
      setShowSugg(false);
      setMessages((prev) => [...prev, { role: "user", text: msg }]);
      setTyping(true);

      historyRef.current.push({ role: "user", content: msg });

      try {
        const relevant = retrieveItems(msg, menuData);
        const context = buildContext(relevant, catData);
        const catList = catData.map((c) => c.name).join(", ");

        const systemPrompt = `Bạn là trợ lý ảo của nhà hàng The King Restaurant — nhà hàng cao cấp phong cách hoàng gia.
    NHIỆM VỤ: Tư vấn về thực đơn, giá cả, nguyên liệu, gợi ý món ăn cho khách.
    QUY TẮC:
    • Chỉ trả lời dựa trên dữ liệu thực đơn bên dưới
    • Nếu không có thông tin → lịch sự thông báo và gợi ý gọi hotline
    • Nếu hỏi đặt bàn → hướng dẫn vào mục "Đặt Bàn" trên website
    • Trả lời ngắn gọn, thân thiện, tiếng Việt tự nhiên, có thể dùng emoji
    • KHÔNG bịa ra món hay giá không có trong dữ liệu
    DANH MỤC: ${catList || "Đang cập nhật"}
    TỔNG SỐ MÓN: ${menuData.length}
    DỮ LIỆU THỰC ĐƠN LIÊN QUAN:
    ${context || "Không tìm thấy món nào phù hợp."}
      `;

        const res = await fetch(AI_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: systemPrompt,
            messages: historyRef.current.slice(-10),
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const reply =
          data.content?.[0]?.text?.trim() || "Xin lỗi, có lỗi xảy ra!";

        historyRef.current.push({ role: "assistant", content: reply });
        setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Xin lỗi, có lỗi kết nối! Vui lòng thử lại sau 🙏",
          },
        ]);
        console.error("[Chatbot]", err);
      } finally {
        setTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, typing, menuData, catData],
  );

  return (
    <>
      {/* CSS */}
      <style>{`
            @keyframes cbIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
            @keyframes cbDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }
            @keyframes cbPop { from{opacity:0;transform:scale(.88) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
            #cb-input::placeholder{color:rgba(245,237,214,0.28)}
            #cb-input:focus{border-color:rgba(201,168,76,0.45)!important;outline:none}
            #cb-msgs::-webkit-scrollbar{width:4px}
            #cb-msgs::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.25);border-radius:4px}
          `}</style>

      {/* Toggle button */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          width: 58,
          height: 58,
          background: "linear-gradient(135deg,#c9a84c,#e8c97a)",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          boxShadow: "0 4px 20px rgba(201,168,76,.45),0 2px 8px rgba(0,0,0,.4)",
          transition:
            "transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span
          style={{
            transition: "transform .3s",
            transform: open ? "rotate(90deg)" : "none",
            display: "block",
          }}
        >
          {open ? "✕" : "💬"}
        </span>
        {showBadge && !open && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#e74c3c",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #060402",
            }}
          >
            1
          </div>
        )}
      </div>

      {/* Chat box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            zIndex: 9999,
            width: 360,
            maxHeight: 540,
            background: "#0e0c09",
            border: "1px solid rgba(201,168,76,.25)",
            borderRadius: 18,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter,sans-serif",
            boxShadow:
              "0 0 0 1px rgba(201,168,76,.06) inset,0 24px 60px rgba(0,0,0,.7),0 0 40px rgba(201,168,76,.1)",
            animation: "cbPop .28s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "linear-gradient(135deg,#1a1508,#120f07)",
              borderBottom: "1px solid rgba(201,168,76,.15)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#c9a84c,#8a6a1f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  boxShadow: "0 0 12px rgba(201,168,76,.35)",
                }}
              >
                👑
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f5edd6",
                    letterSpacing: ".02em",
                  }}
                >
                  The King Assistant
                </div>
                <div style={{ fontSize: 10.5, color: "#4caf79", marginTop: 1 }}>
                  ● Đang hoạt động
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(245,237,214,.4)",
                fontSize: 14,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
                transition: "all .2s",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c9a84c";
                e.currentTarget.style.background = "rgba(201,168,76,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(245,237,214,.4)";
                e.currentTarget.style.background = "none";
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            id="cb-msgs"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(201,168,76,.25) transparent",
            }}
          >
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.text} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {showSugg && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                padding: "0 14px 10px",
                flexShrink: 0,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s.replace(/^[^\w\s]+\s?/, ""))}
                  style={{
                    padding: "5px 12px",
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,.25)",
                    borderRadius: 50,
                    color: "rgba(201,168,76,.8)",
                    fontSize: 11.5,
                    cursor: "pointer",
                    fontFamily: "Inter,sans-serif",
                    transition: "all .18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,.1)";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,.5)";
                    e.currentTarget.style.color = "#e8c97a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,.25)";
                    e.currentTarget.style.color = "rgba(201,168,76,.8)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              background: "rgba(255,255,255,.02)",
              flexShrink: 0,
            }}
          >
            <input
              id="cb-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Hỏi về thực đơn, giá cả..."
              disabled={typing}
              style={{
                flex: 1,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 10,
                padding: "9px 13px",
                color: "#f0e8d8",
                fontFamily: "Inter,sans-serif",
                fontSize: 13,
                caretColor: "#c9a84c",
                opacity: typing ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={typing || !input.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: "linear-gradient(135deg,#a07830,#c9a84c)",
                border: "none",
                cursor: typing || !input.trim() ? "not-allowed" : "pointer",
                color: "#0e0c09",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .2s",
                boxShadow: "0 2px 8px rgba(201,168,76,.3)",
                opacity: typing || !input.trim() ? 0.45 : 1,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
