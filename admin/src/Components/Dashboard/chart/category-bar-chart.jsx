// category-bar-chart.js
export default function categoryBarChart(data = []) {
  // Convert incoming data to series of { x, y } points which is
  // broadly compatible with MUI X-Charts expectations.
  const categories = data.map((i) => i.category ?? "");

  const totalSeries = data.map((i) => ({ x: i.category ?? "", y: Number(i.total || 0) }));
  const soldSeries = data.map((i) => ({ x: i.category ?? "", y: Number(i.sold || 0) }));

  return {
    // keep a band/category axis but provide series as x/y points
    xAxis: [{ scaleType: "band", data: categories }],
    series: [
      {
        data: totalSeries,
        label: "Tổng sản phẩm",
      },
      {
        data: soldSeries,
        label: "Đã bán",
      },
    ],
    height: 340,
  };
}
