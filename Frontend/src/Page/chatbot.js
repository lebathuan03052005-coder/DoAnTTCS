// Tạo HTML chatbot (nút + box chat)
const chatbotHTML = `
<div id="chatbot-toggle">💬</div>

<div id="chatbot-box">
  <div id="chatbot-header">Hỗ trợ khách hàng</div>
  <div id="chatbot-body"></div>
  <input id="chatbot-input" type="text" placeholder="Nhập tin nhắn..." />
</div>
`;

document.body.insertAdjacentHTML("beforeend", chatbotHTML);

// CSS
const style = document.createElement("style");
style.innerHTML = `
#chatbot-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: #d4af37;
  color: white;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

#chatbot-box {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 300px;
  background: #222;
  color: white;
  border-radius: 10px;
  overflow: hidden;
  display: none;
  font-family: Arial;
}

#chatbot-header {
  background: #d4af37;
  padding: 10px;
  font-weight: bold;
}

#chatbot-body {
  height: 250px;
  overflow-y: auto;
  padding: 10px;
}

#chatbot-input {
  width: 100%;
  border: none;
  padding: 10px;
  outline: none;
}
`;
document.head.appendChild(style);

// Mở / đóng chatbot
const toggleBtn = document.getElementById("chatbot-toggle");
const chatbox = document.getElementById("chatbot-box");

toggleBtn.onclick = () => {
  chatbox.style.display = chatbox.style.display === "none" ? "block" : "none";
};

// Xử lý chat
const input = document.getElementById("chatbot-input");
const body = document.getElementById("chatbot-body");

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const userText = input.value;

    body.innerHTML += `<div>👤 ${userText}</div>`;

    let botReply = "Xin lỗi, tôi chưa hiểu 😅";

    if (userText.toLowerCase().includes("đặt bàn")) {
      botReply = "Bạn hãy vào mục 'Đặt Bàn' để đặt nhé!";
    }
    if (userText.toLowerCase().includes("menu")) {
      botReply = "Bạn có thể xem menu ở trang Menu nha!";
    }

    body.innerHTML += `<div>🤖 ${botReply}</div>`;

    input.value = "";
    body.scrollTop = body.scrollHeight;
  }
});
