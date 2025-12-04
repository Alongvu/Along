import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom' // Import thêm Navigate
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import AdminOrder from '../../Components/AdminOrder/AdminOrder'
import ContactProduct from '../../Components/ContactProduct/ContactProduct'
import AdminInvoices from '../../Components/AdminInvoices/AdminInvoices'
import Dashboard from '../../Components/Dashboard/Dashboard'
import Login from "../Login.jsx";
import ProtectedRoute from '../../Components/ProtectedRoute/ProtectedRoute.jsx';

const Admin = () => {
  return (
    <div className='admin'>
      {/* Chỉ hiển thị Sidebar khi ĐÃ đăng nhập và KHÔNG ở trang login */}
      {/* Cách đơn giản là kiểm tra path, hoặc ProtectedRoute sẽ tự xử lý việc không render Outlet */}
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<Login />} />

        {/* Các route cần được bảo vệ */}
        <Route element={<ProtectedRoute />}>
          {/* Sidebar chỉ nên hiển thị trong các trang được bảo vệ */}
          <Route
            path="/*"
            element={
              <>
                <Sidebar />
                <div className="admin-content"> {/* Bọc nội dung chính */}
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirect / về /dashboard */}
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/addproduct' element={<AddProduct />} />
                        <Route path='/listproduct' element={<ListProduct />} />
                        <Route path='/adminproduct' element={<AdminOrder />} />
                        <Route path='/contactproduct' element={<ContactProduct />} />
                        <Route path='/admininvoices' element={<AdminInvoices />} />
                    </Routes>
                </div>
              </>
            }
          />
        </Route>
      </Routes>
    </div>
  )
}
export default Admin