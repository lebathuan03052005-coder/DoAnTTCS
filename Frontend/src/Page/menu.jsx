import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar";
import "./menu.css";

// ─── Mock data theo đúng schema SQL của bạn ─────────────────────────────────
const CATEGORIES = [
  { id: 0, name: "Tất cả", icon: "👑" },
  { id: 1, name: "Khai vị", icon: "🥗" },
  { id: 2, name: "Món chính", icon: "🍖" },
  { id: 3, name: "Hải sản", icon: "🦞" },
  { id: 4, name: "Tráng miệng", icon: "🍮" },
  { id: 5, name: "Đồ uống", icon: "🥂" },
];

const MOCK_MENU = [
  {
    id: 1,
    category_id: 1,
    item_name: "Gỏi cuốn tôm thịt",
    description:
      "Gỏi cuốn tươi ngon với tôm, thịt heo, bún, rau thơm, chấm tương hoisin đặc biệt.",
    price: 85000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Tôm, thịt heo, bún tươi, xà lách, húng quế, bánh tráng",
    allergy_warnings: "Hải sản, gluten",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "2 cuốn",
  },
  {
    id: 2,
    category_id: 1,
    item_name: "Chả giò hải sản",
    description:
      "Chả giò giòn rụm nhân hải sản, cà rốt, mộc nhĩ, miến thủy tinh.",
    price: 95000,
    image_url: "",
    is_best_seller: false,
    ingredients: "Tôm, mực, cá, cà rốt, mộc nhĩ, miến",
    allergy_warnings: "Hải sản, gluten",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "4 chiếc",
  },
  {
    id: 3,
    category_id: 2,
    item_name: "Bò bít tết sốt tiêu đen",
    description:
      "Thăn bò Mỹ 200g áp chảo vừa chín, sốt tiêu đen đậm đà, khoai tây chiên và rau củ nướng.",
    price: 320000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Thăn bò Mỹ, tiêu đen, khoai tây, cà rốt, đậu hà lan",
    allergy_warnings: "Sữa",
    is_spicy: true,
    is_vegetarian: false,
    serving_size: "200g",
  },
  {
    id: 4,
    category_id: 2,
    item_name: "Sườn heo nướng BBQ",
    description:
      "Sườn heo non ướp 24h với sốt BBQ đặc chế, nướng chậm lửa than hoa, thơm lừng mềm tan.",
    price: 280000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Sườn heo, sốt BBQ, mật ong, tỏi, gia vị đặc biệt",
    allergy_warnings: "Không có",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "350g",
  },
  {
    id: 5,
    category_id: 3,
    item_name: "Tôm hùm nướng bơ tỏi",
    description:
      "Tôm hùm Canada tươi sống 600g, nướng với bơ tỏi pháp và thảo mộc tươi.",
    price: 980000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Tôm hùm Canada, bơ Pháp, tỏi, thảo mộc, chanh",
    allergy_warnings: "Hải sản, sữa",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "600g",
  },
  {
    id: 6,
    category_id: 3,
    item_name: "Cá hồi sốt chanh leo",
    description:
      "Phi lê cá hồi Na Uy áp chảo vàng giòn, sốt chanh leo nhiệt đới thanh chua dịu.",
    price: 420000,
    image_url: "",
    is_best_seller: false,
    ingredients: "Cá hồi Na Uy, chanh leo, cream, cà pháo, rau mùi",
    allergy_warnings: "Hải sản, sữa",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "180g",
  },
  {
    id: 7,
    category_id: 4,
    item_name: "Crème brûlée vani Madagascar",
    description:
      "Bánh flan kem vani Madagascar cổ điển, mặt đường caramel giòn tan, trang trí quả mọng tươi.",
    price: 95000,
    image_url: "",
    is_best_seller: false,
    ingredients: "Kem, trứng, vani Madagascar, đường, quả mọng",
    allergy_warnings: "Trứng, sữa",
    is_spicy: false,
    is_vegetarian: true,
    serving_size: "120ml",
  },
  {
    id: 8,
    category_id: 4,
    item_name: "Bánh chocolate fondant",
    description:
      "Bánh chocolate ấm chảy bên trong, kem vanilla bên cạnh, rắc bột cacao Bỉ.",
    price: 110000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Chocolate 70%, bơ, trứng, bột mì, kem vanilla",
    allergy_warnings: "Trứng, sữa, gluten",
    is_spicy: false,
    is_vegetarian: true,
    serving_size: "1 cái",
  },
  {
    id: 9,
    category_id: 5,
    item_name: "Rượu vang đỏ Pháp",
    description:
      "Château Margaux 2018, mượt mà, hương cherry đen, tanin tinh tế, hậu vị kéo dài.",
    price: 350000,
    image_url: "",
    is_best_seller: false,
    ingredients: "Nho Cabernet Sauvignon, Merlot",
    allergy_warnings: "Sulfite",
    is_spicy: false,
    is_vegetarian: true,
    serving_size: "150ml",
  },
  {
    id: 10,
    category_id: 5,
    item_name: "Cocktail The King Special",
    description:
      "Cocktail signature của nhà hàng: vodka, passion fruit, lychee, bạc hà tươi và soda.",
    price: 150000,
    image_url: "",
    is_best_seller: true,
    ingredients: "Vodka, passion fruit, vải, bạc hà, soda, đá",
    allergy_warnings: "Cồn",
    is_spicy: false,
    is_vegetarian: true,
    serving_size: "250ml",
  },
];

// ─── Emoji placeholder theo category ────────────────────────────────────────
const CATEGORY_EMOJI = { 1: "🥗", 2: "🍖", 3: "🦞", 4: "🍮", 5: "🥂" };

// ─── Format tiền VND ─────────────────────────────────────────────────────────
const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

// ─── Component: Badge ────────────────────────────────────────────────────────
const Badge = ({ label, type }) => (
  <span className={`badge badge--${type}`}>{label}</span>
);

// ─── Component: MenuCard ─────────────────────────────────────────────────────
const MenuCard = ({ item, onClick }) => (
  <article
    className="menu-card"
    onClick={() => onClick(item)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick(item)}
  >
    <div className="menu-card__image-wrap">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.item_name}
          className="menu-card__image"
        />
      ) : (
        <div className="menu-card__image-placeholder">
          {CATEGORY_EMOJI[item.category_id] || "🍽️"}
        </div>
      )}
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
  </article>
);

// ─── Component: Modal chi tiết ───────────────────────────────────────────────
const ItemModal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
        <div className="modal__image-wrap">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.item_name}
              className="modal__image"
            />
          ) : (
            <div className="modal__image-placeholder">
              {CATEGORY_EMOJI[item.category_id] || "🍽️"}
            </div>
          )}
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
          <div className="modal__meta">
            <div className="modal__meta-row">
              <span className="modal__meta-label">🍽 Khẩu phần</span>
              <span>{item.serving_size}</span>
            </div>
            <div className="modal__meta-row">
              <span className="modal__meta-label">🥘 Nguyên liệu</span>
              <span>{item.ingredients}</span>
            </div>
            {item.allergy_warnings && item.allergy_warnings !== "Không có" && (
              <div className="modal__meta-row modal__meta-row--warn">
                <span className="modal__meta-label">⚠️ Dị ứng</span>
                <span>{item.allergy_warnings}</span>
              </div>
            )}
          </div>
          <button className="modal__order-btn">Thêm vào order</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    spicy: false,
    veg: false,
    best: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch từ API thực — fallback sang mock data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Endpoint thật khớp với backend Express của bạn
        const res = await fetch("http://localhost:5000/api/admin/menu");
        if (!res.ok) throw new Error("API error");
        const result = await res.json();
        // Backend trả { success: true, data: [...] }
        setMenuItems(result.data || result);
      } catch {
        // Dùng mock data khi chưa có backend
        setMenuItems(MOCK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const toggleFilter = useCallback((key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Lọc & tìm kiếm
  const filtered = menuItems.filter((item) => {
    if (activeCategory !== 0 && item.category_id !== activeCategory)
      return false;
    if (filters.spicy && !item.is_spicy) return false;
    if (filters.veg && !item.is_vegetarian) return false;
    if (filters.best && !item.is_best_seller) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.item_name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="menu-page">
      {/* ── Navbar dùng chung toàn site ── */}
      <Navbar />
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
            <button
              className="menu-search__clear"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <nav className="menu-tabs" aria-label="Danh mục">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`menu-tab ${activeCategory === cat.id ? "menu-tab--active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="menu-tab__icon">{cat.icon}</span>
            <span className="menu-tab__name">{cat.name}</span>
          </button>
        ))}
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
        <span className="menu-filters__count">{filtered.length} món</span>
      </div>

      {/* ── Grid ── */}
      <main className="menu-grid-wrap">
        {loading ? (
          <div className="menu-loading">
            <div className="menu-loading__spinner" />
            <p>Đang tải thực đơn...</p>
          </div>
        ) : error ? (
          <div className="menu-error">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <span>🔍</span>
            <p>Không tìm thấy món phù hợp</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
