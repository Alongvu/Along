import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";

import categoryBarChart from "./chart/category-bar-chart";
import soldPieChart from "./chart/sold-pie-chart";
import revenueLineChart from "./chart/revenue-line-chart";

import "./Dashboard.css";

const categoryOrder = ["men", "women", "kid", "accessory"];
const displayNames = {
  men: "Men",
  women: "Women",
  kid: "Kid",
  accessory: "Accessory",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:4000/stats");
        if (!cancelled) {
          setStats(res.data);
          setError(null);
        }
      } catch (err) {
        console.error("❌ Lỗi khi gọi /stats:", err);
        if (!cancelled)
          setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  const {
    productsByCategory = {},
    productsSoldByCategory = {},
    orders: ordersSummary = {},
    revenueByMonth = {},
    monthlyLabels = [],
  } = stats;

  const { totalOrders = 0, totalRevenue = 0, totalSoldProducts = 0 } =
    ordersSummary;

  const barData = categoryOrder.map((cat) => ({
    category: displayNames[cat] || cat,
    total: Number(productsByCategory[cat] || 0),
    sold: Number(productsSoldByCategory[cat] || 0),
  }));

  const pieData = categoryOrder
    .filter((cat) => Number(productsSoldByCategory[cat] || 0) > 0)
    .map((cat, idx) => ({
      id: idx,
      label: displayNames[cat] || cat,
      value: Number(productsSoldByCategory[cat] || 0),
    }));

 // 🔹 Nhãn hiển thị trên trục X
const lineLabels =
  monthlyLabels.length > 0
    ? monthlyLabels
    : Object.keys(revenueByMonth || {});

// 🔹 Dữ liệu doanh thu (triệu đồng)
const lineData = lineLabels.map((lbl) => {
  const raw = revenueByMonth?.[lbl];
  const val = parseFloat(raw);
  return Number.isFinite(val) ? val / 1_000_000 : 0;
});

// 🔹 Debug nếu cần
console.log("✅ lineLabels:", lineLabels);
console.log("✅ lineData:", lineData);



  const totalProducts = Object.values(productsByCategory || {}).reduce(
    (s, v) => s + Number(v || 0),
    0
  );

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">📊 Dashboard thống kê</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card blue">
          <h3>Đơn hàng</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="dashboard-card yellow">
          <h3>Doanh thu</h3>
          <p>{Number(totalRevenue).toLocaleString()} $</p>
        </div>
        <div className="dashboard-card red">
          <h3>Tổng sản phẩm</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="dashboard-card green">
          <h3>SP đã bán</h3>
          <p>{totalSoldProducts}</p>
        </div>
      </div>

      {/* --- Biểu đồ Cột --- */}
      <div className="dashboard-chart">
        <h4>📦 Sản phẩm tồn & đã bán theo danh mục</h4>
        <BarChart {...categoryBarChart(barData)} />
      </div>

      {/* --- Biểu đồ Tròn --- */}
      <div className="dashboard-chart">
        <h4>🍰 Tỷ lệ sản phẩm đã bán theo danh mục</h4>
        {pieData.length > 0 ? (
          <PieChart {...soldPieChart(pieData)} />
        ) : (
          <p>Không có dữ liệu để hiển thị biểu đồ tròn.</p>
        )}
      </div>

      {/* --- Biểu đồ Đường --- */}
      <div className="dashboard-chart wide">
        <h4>📈 Doanh thu theo tháng</h4>
        <LineChart {...revenueLineChart(lineLabels, lineData)} />
      </div>
    </div>
  );
}
