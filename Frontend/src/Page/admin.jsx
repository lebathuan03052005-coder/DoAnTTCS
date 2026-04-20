import Navabar from "../Component/navbar";
import "./admin.css";

const Admin = () => {
  return (
    <div className="admin-bg">
      <div className="bg-overlay"></div>
      <Navabar />
      <main className="admin-page">
        <h1>Chào mừng đến với trang quản trị</h1>
        {/* Nội dung quản trị sẽ được thêm vào đây */}
      </main>
    </div>
  );
};
