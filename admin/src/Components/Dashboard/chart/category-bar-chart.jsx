export default function categoryBarChart(data = []) {
  const categories = data.map((i) => i.category ?? "");
  const totalValues = data.map((i) => Number(i.total || 0));
  const soldValues = data.map((i) => Number(i.sold || 0));

  return {
    xAxis: [{ scaleType: "band", data: categories }],
    series: [
      {
        data: totalValues,
        label: "Tổng sản phẩm",
      },
      {
        data: soldValues,
        label: "Đã bán",
      },
    ],
    height: 340,
  };
}
