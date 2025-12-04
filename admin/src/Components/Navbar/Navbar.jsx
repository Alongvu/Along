// src/Components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';
import navlogo from '../../assets/nav-logo.svg';
import navProfile from '../../assets/profile_icon.png';
import searchicon from '../../assets/search_icon.svg';

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  
  // Ref để xử lý click ra ngoài menu
  const menuRef = useRef(null);

  // Kiểm tra trạng thái đăng nhập
  const isAuthenticated = !!localStorage.getItem('auth-token');

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-email'); // Xóa luôn email nếu có lưu
    setShowUserMenu(false);
    navigate('/login');
  };

  // Effect để đóng menu khi click ra ngoài (Tùy chọn - giúp UX tốt hơn)
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setShowUserMenu(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [menuRef]);


  return (
    <div className='navbar'>
      <Link to="/">
        <img src={navlogo} alt="Logo" className="nav-logo" />
      </Link>

      <div className="nav-right">
        {/* Ô tìm kiếm */}
        {showSearch && (
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        )}

        <img
          src={searchicon}
          alt="search"
          className="search_icon"
          onClick={() => setShowSearch(!showSearch)}
        />

        {/* Khu vực Login / Profile */}
        {isAuthenticated ? (
          // --- TRẠNG THÁI ĐÃ ĐĂNG NHẬP (MỚI) ---
          // Chỉ hiển thị logo profile, click vào sẽ mở menu
          <div className="profile-wrapper" ref={menuRef} onClick={() => setShowUserMenu(!showUserMenu)}>
              <img src={navProfile} alt="Profile" className="nav-profile" style={{ cursor: 'pointer' }} />
              
              {/* Dropdown menu hiện ra khi click vào logo */}
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </div>
              )}
          </div>
        ) : (
          // --- TRẠNG THÁI CHƯA ĐĂNG NHẬP (CŨ) ---
          <>
            <Link to="/login" className="nav-login-btn">Login</Link>
            <img src={navProfile} alt="Profile" className="nav-profile" />
          </>
        )}

      </div>
    </div>
  );
}

export default Navbar;