import React from "react";
import Navbar from "../components/navbar";
import "./menu.css";

const Menu = () => {
  return (
    <div
      className="menu-bg"
      style={{
        backgroundImage: 'url("/anh/menu.jpg")',
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="bg-overlay"
        style={{ background: "rgba(0,0,0,0.75)" }}
      ></div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <Navbar />
      </div>
      <main style={{ paddingTop: "100px", position: "relative", zIndex: 1 }}>
        <section className="menu-section" style={{ paddingTop: "60px" }}>
          <div className="container">
            <h2 className="section-title">Thực Đơn Tinh Hoa</h2>
          </div>
        </section>
      </main>

      <footer id="contact"></footer>
    </div>
  );
};

export default Menu;
