import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/navbar";
import "./menu.css";

// ─── Canvas: gold dust particles ─────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.3, speed: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.3, alpha: Math.random() * 0.6 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));
    const embers = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1.5, speed: Math.random() * 0.25 + 0.05,
      drift: (Math.random() - 0.5) * 0.5, alpha: Math.random() * 0.45 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;
      pts.forEach((p) => {
        p.y -= p.speed; p.x += p.drift + Math.sin(t + p.pulse) * 0.25; p.pulse += 0.008;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(t * 1.4 + p.pulse));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${a})`; ctx.fill();
      });
      embers.forEach((e) => {
        e.y -= e.speed; e.x += e.drift + Math.sin(t * 0.7 + e.pulse) * 0.4; e.pulse += 0.006;
        if (e.y < -6) { e.y = canvas.height + 6; e.x = Math.random() * canvas.width; }
        const a = e.alpha * (0.5 + 0.5 * Math.sin(t + e.pulse));
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        g.addColorStop(0, `rgba(240,208,96,${a})`);
        g.addColorStop(0.4, `rgba(212,175,55,${a * 0.4})`);
        g.addColorStop(1, `rgba(212,175,55,0)`);
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,230,120,${Math.min(a * 1.5, 1)})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="menu-bg__canvas" aria-hidden="true" />;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_EMOJI = { 1: "🥗", 2: "🍖", 3: "🦞", 4: "🍮", 5: "🥂" };
const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => (
  <span className={`badge badge--${type}`}>{label}</span>
);

// ─── MenuCard ─────────────────────────────────────────────────────────────────
const PLACEHOLDER_PATTERNS = [
  "radial-gradient(circle at 30% 40%, #2a1f08 0%, #0f0b04 60%, #1a1208 100%)",
  "radial-gradient(circle at 70% 60%, #1e1a08 0%, #0a0804 60%, #160f06 100%)",
  "radial-gradient(circle at 50% 30%, #231a06 0%, #0c0904 60%, #1c1408 100%)",
  "radial-gradient(circle at 20% 70%, #1a1408 0%, #080604 60%, #211808 100%)",
];

const MenuCard = ({ item, onClick, index }) => {
  const patternIdx = (item.id || index) % PLACEHOLDER_PATTERNS.length;
  return (
    <article
      className="menu-card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      style={{ animationDelay: `${index * 60}ms` }}
      onKeyDown={(e) => e.key === "Enter" && onClick(item)}
    >
      <div className="menu-card__image-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.item_name} className="menu-card__image" />
        ) : (
          <div
            className="menu-card__image-placeholder"
            style={{ background: PLACEHOLDER_PATTERNS[patternIdx] }}
          >
            {/* Decorative corner ornaments */}
            <svg className="menu-card__ornament" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 4 L4 20 M4 4 L20 4" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M76 4 L76 20 M76 4 L60 4" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 76 L4 60 M4 76 L20 76" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M76 76 L76 60 M76 76 L60 76" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="18" stroke="rgba(212,175,55,0.15)" strokeWidth="1"/>
              <circle cx="40" cy="40" r="24" stroke="rgba(212,175,55,0.07)" strokeWidth="1"/>
            </svg>
            <span className="menu-card__emoji">{CATEGORY_EMOJI[item.category_id] || "🍽️"}</span>
          </div>
        )}
        <div className="menu-card__image-overlay" />
        <div className="menu-card__badges">
          {item.is_best_seller && <Badge label="👑 Bestseller" type="gold" />}
          {item.is_spicy && <Badge label="🌶 Cay" type="spicy" />}
          {item.is_vegetarian && <Badge label="🌿 Chay" type="veg" />}
        </div>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{item.item_name}</h3>
        <p className="menu-card__desc">{item.description}</p>
        <div className="menu-card__footer">
          <span className="menu-card__price">{formatPrice(item.price)}</span>
          <span className="menu-card__size">{item.serving_size}</span>
        </div>
      </div>
      <div className="menu-card__shine" />
      <div className="menu-card__glow" />
    </article>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const ItemModal = ({ item, onClose }) => {
  if (!item) return null;
  const patternIdx = (item.id || 0) % PLACEHOLDER_PATTERNS.length;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Đóng">✕</button>
        <div className="modal__image-wrap">
          {item.image_url ? (
            <img src={item.image_url} alt={item.item_name} className="modal__image" />
          ) : (
            <div className="modal__image-placeholder" style={{ background: PLACEHOLDER_PATTERNS[patternIdx] }}>
              <svg className="modal__ornament" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M8 8 L8 30 M8 8 L30 8" stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M112 8 L112 30 M112 8 L90 8" stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 112 L8 90 M8 112 L30 112" stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M112 112 L112 90 M112 112 L90 112" stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="60" cy="60" r="28" stroke="rgba(212,175,55,0.2)" strokeWidth="1"/>
                <circle cx="60" cy="60" r="36" stroke="rgba(212,175,55,0.1)" strokeWidth="1"/>
                <circle cx="60" cy="60" r="44" stroke="rgba(212,175,55,0.05)" strokeWidth="1"/>
              </svg>
              <span className="modal__emoji">{CATEGORY_EMOJI[item.category_id] || "🍽️"}</span>
            </div>
          )}
          <div className="modal__image-gradient" />
        </div>
        <div className="modal__content">
          <div className="modal__badges">
            {item.is_best_seller && <Badge label="👑 Bestseller" type="gold" />}
            {item.is_spicy && <Badge label="🌶 Cay" type="spicy" />}
            {item.is_vegetarian && <Badge label="🌿 Chay" type="veg" />}
          </div>
          <h2 className="modal__name">{item.item_name}</h2>
          <p className="modal__price">{formatPrice(item.price)}</p>
          <p className="modal__desc">{item.description}</p>
          <div className="modal__divider" />
          <div className="modal__meta">
            <div className="modal__meta-row">
              <span className="modal__meta-label">🍽 Khẩu phần</span>
              <span className="modal__meta-value">{item.serving_size}</span>
            </div>
            <div className="modal__meta-row">
              <span className="modal__meta-label">🥘 Nguyên liệu</span>
              <span className="modal__meta-value">{item.ingredients}</span>
            </div>
            {item.allergy_warnings && item.allergy_warnings !== "Không có" && (
              <div className="modal__meta-row modal__meta-row--warn">
                <span className="modal__meta-label">⚠️ Dị ứng</span>
                <span className="modal__meta-value">{item.allergy_warnings}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Menu() {
  const [menuItems, setMenuItems]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch]             = useState("");
  const [categories, setCategories]     = useState([]);
  const [filters, setFilters]           = useState({ spicy: false, veg: false, best: false });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/admin/menu");
        if (!res.ok) throw new Error(`Menu API lỗi: ${res.status}`);
        const d = await res.json();
        setMenuItems(d.data || d || []);
      } catch (err) { console.error(err); setError("Không tải được dữ liệu món ăn"); }
      try {
        const res = await fetch("http://localhost:5000/api/v2/categories");
        if (!res.ok) throw new Error(`Categories API lỗi: ${res.status}`);
        const d = await res.json();
        if (Array.isArray(d)) setCategories([{ id: 0, name: "Tất cả", icon: "👑" }, ...d]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleFilter = useCallback(
    (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] })), []
  );

  const filtered = menuItems.filter((item) => {
    if (activeCategory !== 0 && item.category_id !== activeCategory) return false;
    if (filters.spicy && !item.is_spicy) return false;
    if (filters.veg && !item.is_vegetarian) return false;
    if (filters.best && !item.is_best_seller) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.item_name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="menu-page">

      {/* ── Cinematic Background ── */}
      <div className="menu-bg" aria-hidden="true">
        <div className="menu-bg__layer menu-bg__layer--radial1" />
        <div className="menu-bg__layer menu-bg__layer--radial2" />
        <div className="menu-bg__layer menu-bg__layer--radial3" />
        <div className="menu-bg__orb menu-bg__orb--1" />
        <div className="menu-bg__orb menu-bg__orb--2" />
        <div className="menu-bg__orb menu-bg__orb--3" />
        <div className="menu-bg__orb menu-bg__orb--4" />
        <div className="menu-bg__grid" />
        <div className="menu-bg__streak menu-bg__streak--1" />
        <div className="menu-bg__streak menu-bg__streak--2" />
        <div className="menu-bg__grain" />
        <div className="menu-bg__layer menu-bg__layer--vignette" />
      </div>
      <ParticleCanvas />

      <Navbar />

      {/* ── Hero Header ── */}
      <header className="menu-hero">
        <div className="menu-hero__ornament" aria-hidden="true">
          <svg viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="16" x2="118" y2="16" stroke="url(#gl)" strokeWidth="1"/>
            <polygon points="134,8 142,16 134,24 126,16" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="rgba(212,175,55,0.12)"/>
            <circle cx="160" cy="16" r="5" stroke="rgba(212,175,55,0.8)" strokeWidth="1" fill="rgba(212,175,55,0.15)"/>
            <polygon points="186,8 194,16 186,24 178,16" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="rgba(212,175,55,0.12)"/>
            <line x1="202" y1="16" x2="320" y2="16" stroke="url(#gr)" strokeWidth="1"/>
            <defs>
              <linearGradient id="gl" x1="0" y1="0" x2="118" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(212,175,55,0)"/>
                <stop offset="100%" stopColor="rgba(212,175,55,0.6)"/>
              </linearGradient>
              <linearGradient id="gr" x1="202" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(212,175,55,0.6)"/>
                <stop offset="100%" stopColor="rgba(212,175,55,0)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="menu-hero__eyebrow">The King Restaurant</p>
        <h1 className="menu-hero__title">Thực Đơn</h1>
        <p className="menu-hero__subtitle">Trải nghiệm ẩm thực đỉnh cao — mỗi món là một tác phẩm</p>
        <div className="menu-hero__ornament" aria-hidden="true">
          <svg viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="16" x2="118" y2="16" stroke="url(#gl2)" strokeWidth="1"/>
            <polygon points="134,8 142,16 134,24 126,16" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="rgba(212,175,55,0.12)"/>
            <circle cx="160" cy="16" r="5" stroke="rgba(212,175,55,0.8)" strokeWidth="1" fill="rgba(212,175,55,0.15)"/>
            <polygon points="186,8 194,16 186,24 178,16" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="rgba(212,175,55,0.12)"/>
            <line x1="202" y1="16" x2="320" y2="16" stroke="url(#gr2)" strokeWidth="1"/>
            <defs>
              <linearGradient id="gl2" x1="0" y1="0" x2="118" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(212,175,55,0)"/>
                <stop offset="100%" stopColor="rgba(212,175,55,0.6)"/>
              </linearGradient>
              <linearGradient id="gr2" x1="202" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(212,175,55,0.6)"/>
                <stop offset="100%" stopColor="rgba(212,175,55,0)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>

      {/* ── Search ── */}
      <div className="menu-search-wrap">
        <div className="menu-search">
          <span className="menu-search__icon">🔍</span>
          <input
            className="menu-search__input"
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="menu-search__clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <nav className="menu-tabs" aria-label="Danh mục">
        <div className="menu-tabs__track">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-tab ${activeCategory === cat.id ? "menu-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="menu-tab__icon">{cat.icon}</span>
              <span className="menu-tab__name">{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Quick Filters ── */}
      <div className="menu-filters">
        <span className="menu-filters__label">Lọc nhanh:</span>
        {[
          { key: "best", label: "👑 Bestseller" },
          { key: "spicy", label: "🌶 Cay" },
          { key: "veg", label: "🌿 Chay" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`filter-chip ${filters[key] ? "filter-chip--active" : ""}`}
            onClick={() => toggleFilter(key)}
          >
            {label}
          </button>
        ))}
        <span className="menu-filters__count">
          <span className="menu-filters__count-num">{filtered.length}</span> món
        </span>
      </div>

      {/* ── Grid ── */}
      <main className="menu-grid-wrap">
        {loading ? (
          <div className="menu-loading">
            <div className="menu-loading__crest" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" stroke="rgba(212,175,55,0.15)" strokeWidth="1"/>
                <circle cx="32" cy="32" r="20" stroke="rgba(212,175,55,0.25)" strokeWidth="1.5" strokeDasharray="4 3"/>
                <circle cx="32" cy="32" r="10" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5"/>
                <circle cx="32" cy="32" r="3" fill="rgba(212,175,55,0.8)"/>
              </svg>
            </div>
            <div className="menu-loading__ring">
              <div /><div /><div /><div />
            </div>
            <p className="menu-loading__text">Đang tải thực đơn...</p>
          </div>
        ) : error ? (
          <div className="menu-empty">
            <div className="menu-empty__icon-wrap">
              <span className="menu-empty__icon">⚠️</span>
            </div>
            <p className="menu-empty__title">Không thể kết nối</p>
            <p className="menu-empty__sub">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <div className="menu-empty__icon-wrap">
              <svg className="menu-empty__svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="34" cy="34" r="20" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5"/>
                <circle cx="34" cy="34" r="28" stroke="rgba(212,175,55,0.15)" strokeWidth="1"/>
                <line x1="49" y1="49" x2="62" y2="62" stroke="rgba(212,175,55,0.5)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="28" y1="34" x2="40" y2="34" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="menu-empty__title">Không tìm thấy món phù hợp</p>
            <p className="menu-empty__sub">Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </main>

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
