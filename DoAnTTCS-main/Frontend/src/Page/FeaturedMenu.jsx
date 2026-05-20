import { useState, useEffect } from "react";

/**
 * FeaturedMenu — "Món Ăn Được Yêu Thích" cho homePage.jsx
 *
 * Cách dùng trong homePage.jsx:
 *   import FeaturedMenu from "./FeaturedMenu";
 *   ...
 *   <FeaturedMenu />
 *
 * Dữ liệu lấy từ: GET http://localhost:5000/api/admin/menu
 * Tự lọc is_best_seller === true
 * Admin bật ★ trong adminMenuList → món tự xuất hiện ở đây
 */

const API = "http://localhost:5000/api/admin/menu";

const fmt = (p) => Number(p).toLocaleString("vi-VN") + " VNĐ";

export default function FeaturedMenu() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx,     setIdx]     = useState(0);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => {
        const all = d.data || d || [];
        // Chỉ lấy món đang bật Bestseller
        setItems(all.filter((i) => i.is_best_seller));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-slide mỗi 3.5 giây
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((c) => (c + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [items]);

  if (loading || items.length === 0) return null;

  // Hiển thị 3 thẻ (hoặc ít hơn nếu dữ liệu ít)
  const visible = items.length <= 3
    ? items
    : [0, 1, 2].map((o) => items[(idx + o) % items.length]);

  return (
    <section style={{ padding: "60px 20px", textAlign: "center" }}>
      {/* Tiêu đề */}
      <h2 style={{
        fontSize: "clamp(1.4rem,3vw,2rem)",
        color: "#d4af37",
        marginBottom: 8,
        fontFamily: "'Cinzel',serif",
      }}>
        ♛ Món Ăn Được Yêu Thích
      </h2>
      <p style={{ color: "#888", marginBottom: 36, fontSize: ".9rem" }}>
        Những món được thực khách lựa chọn nhiều nhất
      </p>

      {/* Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 900, margin: "0 auto" }}>
        {/* Nút trái */}
        {items.length > 3 && (
          <button onClick={() => setIdx((c) => (c - 1 + items.length) % items.length)}
            style={arrowStyle}>❮</button>
        )}

        {/* Thẻ món */}
        <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
          {visible.map((item, i) => (
            <div key={item.id} style={{
              ...cardStyle,
              transform: visible.length === 3 && i === 1 ? "scale(1.04)" : "scale(1)",
              border: visible.length === 3 && i === 1
                ? "2px solid rgba(212,175,55,.7)"
                : "1px solid rgba(255,255,255,.08)",
            }}>
              {/* Ảnh */}
              <div style={{ height: 160, background: "#1a1712", display: "flex",
                alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.item_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "3.5rem" }}>🍽️</span>
                }
              </div>

              {/* Thông tin */}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{
                    background: "rgba(212,175,55,.85)", color: "#0d0b08",
                    fontSize: 11, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 20,
                  }}>★ Bestseller</span>
                  {item.is_spicy && (
                    <span style={{ marginLeft: 4, background: "rgba(192,57,43,.8)",
                      color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      fontWeight: 700 }}>🌶 Cay</span>
                  )}
                </div>
                <h3 style={{ fontSize: ".95rem", fontWeight: 600,
                  color: "#f5edd6", margin: "6px 0 4px", textAlign: "left" }}>
                  {item.item_name}
                </h3>
                <p style={{ fontSize: ".8rem", color: "#888",
                  margin: "0 0 10px", textAlign: "left",
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {item.description || item.serving_size}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#d4af37", fontSize: "1rem" }}>
                    {fmt(item.price)}
                  </span>
                  <span style={{ fontSize: ".75rem", color: "#555",
                    border: "1px solid #333", borderRadius: 20, padding: "2px 8px" }}>
                    {item.serving_size}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút phải */}
        {items.length > 3 && (
          <button onClick={() => setIdx((c) => (c + 1) % items.length)}
            style={arrowStyle}>❯</button>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx % items.length ? 22 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: i === idx % items.length ? "#d4af37" : "#333",
              cursor: "pointer",
              transition: "all .3s",
              padding: 0,
            }} />
          ))}
        </div>
      )}

      {/* Nút xem thêm */}
      <a href="/menu" style={{
        display: "inline-block", marginTop: 28,
        padding: "12px 32px",
        background: "linear-gradient(135deg,#8a6a1f,#d4af37)",
        color: "#0d0b08", borderRadius: 8,
        fontWeight: 700, textDecoration: "none",
        fontSize: ".9rem", letterSpacing: ".05em",
        transition: "opacity .2s",
      }}>
        Xem toàn bộ thực đơn →
      </a>
    </section>
  );
}

const arrowStyle = {
  background: "rgba(212,175,55,.1)",
  border: "1px solid rgba(212,175,55,.3)",
  color: "#d4af37",
  borderRadius: "50%",
  width: 40, height: 40,
  fontSize: "1.1rem",
  cursor: "pointer",
  flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all .2s",
};

const cardStyle = {
  flex: "1 1 220px",
  maxWidth: 260,
  background: "#161410",
  borderRadius: 12,
  overflow: "hidden",
  transition: "all .3s",
  textAlign: "left",
};
