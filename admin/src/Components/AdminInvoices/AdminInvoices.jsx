import React, { useState, useEffect } from "react";
import "./AdminInvoices.css";

const AdminInvoices = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/allorders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("❌ Lỗi khi tải danh sách hóa đơn:", err));
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="invoice-container">
      <h2>Danh sách hóa đơn</h2>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Tên khách hàng</th>
            <th>Số điện thoại</th>
            <th>Tổng tiền</th>
            <th>Ngày đặt</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <tr key={order._id || index}>
                <td>{order.id || order._id}</td>
                <td>{order.customer || "Không có"}</td>
                <td>{order.phone || "Không có"}</td>
                <td>{order.total?.toLocaleString() || 0}$</td>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Không có hóa đơn nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header-top">
              <h3>HÓA ĐƠN CHI TIẾTt</h3>
              <span className="close-icon" onClick={handleClose}>
                
              </span>
            </div>

            <div className="invoice-header">
              <p><strong>Khách hàng:</strong> {selectedOrder.customer}</p>
              <p><strong>Số điện thoại:</strong> {selectedOrder.phone || ""}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.address || ""}</p>
              <p><strong>Ngày đặt:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : "—"}</p>
              <p><strong>Đơn vị xuất hoá đơn:</strong> Long Vũ</p>
            </div>

            <table className="invoice-detail-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price?.toLocaleString()}$</td>
                    <td>{(item.price * item.quantity)?.toLocaleString()}$</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-total">
              <p><strong>Tổng cộng:</strong> {selectedOrder.total?.toLocaleString()}$</p>
            </div>

            <div className="invoice-actions">
              <button className="print-btn" onClick={() => window.print()}> In hóa đơn </button>
              <button className="close-btn" onClick={handleClose}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
