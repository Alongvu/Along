// src/Components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Kiểm tra xem token có tồn tại trong localStorage không
  const isAuthenticated = !!localStorage.getItem('auth-token');

  // Nếu đã đăng nhập, cho phép truy cập các route con (Outlet)
  // Nếu chưa, chuyển hướng về trang /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;