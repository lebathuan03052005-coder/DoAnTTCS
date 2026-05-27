import { sql } from "../config/database.js";

// Cache để tránh query DB mỗi lần chat
let cachedContext = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export async function getRestaurantContext() {
  if (cachedContext && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedContext;
  }

  try {
    const kb = await new sql.Request().query(
      `SELECT category, question_key, answer_content FROM knowledge_base ORDER BY category, question_key`,
    );
    const menu = await new sql.Request().query(
      `SELECT c.name AS category_name, m.item_name, m.description, m.price, m.ingredients, m.allergy_warnings, m.is_best_seller, m.is_spicy, m.is_vegetarian, m.serving_size FROM menu m LEFT JOIN categories c ON m.category_id = c.id ORDER BY c.name, m.item_name`,
    );
    const styles = await new sql.Request().query(
      `SELECT style_name, description, bestseller FROM table_styles ORDER BY bestseller DESC, style_name`,
    );
    const tables = await new sql.Request().query(
      `SELECT rt.table_number, rt.location, rt.capacity, ts.style_name FROM restaurant_tables rt LEFT JOIN table_styles ts ON rt.style_id = ts.id WHERE rt.status != 'maintenance' ORDER BY rt.table_number`,
    );

    let prompt = `Bạn là trợ lý tư vấn thông minh của nhà hàng. Hỗ trợ khách hàng tìm hiểu thông tin nhà hàng, tư vấn món ăn, style bàn và hỗ trợ đặt bàn.
Chỉ trả lời dựa trên thông tin bên dưới. Nếu khách hỏi ngoài phạm vi này, đề nghị liên hệ trực tiếp nhà hàng qua số hotline: 0862 680 850 (hoặc nhắn tin qua zalo).
Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.

═══════════════════════════════
🏠 THÔNG TIN NHÀ HÀNG
═══════════════════════════════
- Tên nhà hàng: The King Restaurant
- Slogan: Trải nghiệm ẩm thực hoàng gia ngay tại trung tâm thành phố. Đẳng cấp, tinh tế, gần gũi mà không xa hoa.
- Địa chỉ: 97 Man Thiện, TP Thủ Đức, TP.HCM
- Hotline: 0862 680 850
- Email: lebathuan03052005@gmail.com
- Giờ mở cửa: 09:00 AM - 10:30 PM (tất cả các ngày trong tuần)

═══════════════════════════════
📋 THÔNG TIN & CHÍNH SÁCH NHÀ HÀNG
═══════════════════════════════\n`;

    const kbByCategory = {};
    for (const row of kb.recordset) {
      if (!kbByCategory[row.category]) kbByCategory[row.category] = [];
      kbByCategory[row.category].push(row);
    }
    for (const [cat, items] of Object.entries(kbByCategory)) {
      prompt += `\n## ${cat}\n`;
      for (const item of items)
        prompt += `- ${item.question_key}: ${item.answer_content}\n`;

    }

    prompt += `\n═══════════════════════════════
🪑 STYLE BÀN ĂN
═══════════════════════════════\n`;
    for (const s of styles.recordset) {
      prompt += `\n• ${s.style_name}${s.bestseller ? " ⭐ (Phổ biến nhất)" : ""}\n`;
      if (s.description) prompt += `  ${s.description}\n`;
    }

    prompt += `\n═══════════════════════════════
🍽️ DANH SÁCH BÀN
═══════════════════════════════\n`;
    for (const t of tables.recordset) {
      prompt += `- Bàn ${t.table_number}: ${t.capacity} người | Vị trí: ${t.location} | Style: ${t.style_name || "Tiêu chuẩn"}\n`;
    }

    prompt += `\n═══════════════════════════════
🍜 THỰC ĐƠN
═══════════════════════════════\n`;
    const menuByCategory = {};
    for (const row of menu.recordset) {
      const cat = row.category_name || "Khác";
      if (!menuByCategory[cat]) menuByCategory[cat] = [];
      menuByCategory[cat].push(row);
    }
    for (const [cat, items] of Object.entries(menuByCategory)) {
      prompt += `\n## ${cat}\n`;
      for (const item of items) {
        let line = `• ${item.item_name} — ${Number(item.price).toLocaleString("vi-VN")}đ`;
        if (item.is_best_seller) line += " ⭐";
        if (item.is_spicy)       line += " 🌶️";
        if (item.is_vegetarian)  line += " 🌿";
        if (item.serving_size)   line += ` | Khẩu phần: ${item.serving_size}`;
        prompt += line + "\n";
        if (item.description)       prompt += `  → ${item.description}\n`;
        if (item.ingredients)       prompt += `  Nguyên liệu: ${item.ingredients}\n`;
        if (item.allergy_warnings)  prompt += `  ⚠️ Dị ứng: ${item.allergy_warnings}\n`;

      }
    }

    cachedContext = prompt;
    cacheTime = Date.now();
    console.log("[Context] Đã load dữ liệu nhà hàng, độ dài:", prompt.length);
    return prompt;
  } catch (err) {
    console.error("[Context] Lỗi load dữ liệu nhà hàng:", err.message);
    return "Bạn là trợ lý tư vấn của nhà hàng. Hãy hỗ trợ khách hàng lịch sự. Hiện tại không thể tải dữ liệu, hãy đề nghị khách liên hệ trực tiếp với nhân viên hoặc liên hệ qua email: lebathuan03052005@gmail.com .";

  }
}
