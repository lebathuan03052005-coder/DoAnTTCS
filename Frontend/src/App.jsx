import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./page/homePage";
import Login from "./page/login"; // Giả sử Thuần để file Login ở đây
import Footer from "./components/footer";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Khi ở trang chủ (/) thì CHỈ hiện HomePage */}
          <Route path="/" element={<HomePage />} />

          {/* Khi gõ /login thì CHỈ hiện trang Login */}
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* Footer nằm NGOÀI Routes để trang nào nó cũng hiện ở dưới cùng */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
