import React, { useEffect, useState } from "react";
import "./AdminOrder.css";
import cross_icon from "../../assets/cross_icon.png";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    await fetch("http://localhost:4000/allorders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  };

  const removeOrder = async (id) => {
    await fetch("http://localhost:4000/removeorder", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    await fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="admin-order">
      <h1>All Customer Orders</h1>

      <div className="adminorder-header">
        <p>Order ID</p>
        <p>Customer</p>
        <p>Total</p>
        <p>Status</p>
        <p>Products</p>
        <p>Remove</p>
      </div>
      <hr />

      <div className="adminorder-body">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="adminorder-row">
              <p>{order.id || order._id}</p>
              <p>{order.customer}</p>
              <p>{order.total.toLocaleString()} $</p>
              <p>{order.status}</p>

              <div className="adminorder-products">
                {order.products && order.products.map((p, i) => (
                  <span key={i} className="adminorder-product-item">
                    {p.name} × {p.quantity}
                  </span>
                ))}
              </div>

              <img
                src={cross_icon}
                alt="remove"
                className="adminorder-remove-icon"
                onClick={() => removeOrder(order.id || order._id)}


              />
            </div>
          ))
        ) : (
          <p className="empty-text">Hiện chưa có đơn hàng nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrder;
