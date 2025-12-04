export default function revenueLineChart(labels = [], data = []) {
  let safeLabels = Array.isArray(labels) ? [...labels] : [];
  let safeData = Array.isArray(data) ? [...data] : [];

  // Normalize values to numbers
  safeData = safeData.map((n) => (Number.isFinite(Number(n)) ? Number(n) : 0));

  // If only one point, duplicate with next month so line can render
  if (safeLabels.length === 1 && safeData.length === 1) {
    const [year, month] = safeLabels[0].split("-").map(Number);
    let nextYear = year || new Date().getFullYear();
    let nextMonth = (month || new Date().getMonth() + 1) + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextLabel = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    safeLabels.push(nextLabel);
    safeData.push(safeData[0]);
  }

  // If mismatch lengths, cut to min length
  if (safeLabels.length !== safeData.length) {
    const minLen = Math.min(safeLabels.length, safeData.length);
    safeLabels = safeLabels.slice(0, minLen);
    safeData = safeData.slice(0, minLen);
  }

  // Prepare series as [{ data: [{x,label}, {x,label}], label }]
  const seriesData = safeLabels.map((lbl, idx) => ({ x: lbl, y: Number(safeData[idx] || 0) }));

  // If no data, return empty placeholders
  if (seriesData.length === 0) {
    return {
      xAxis: [{ data: ["Không có dữ liệu"] }],
      series: [
        {
          data: [{ x: "Không có dữ liệu", y: 0 }],
          label: "Doanh thu",
        },
      ],
      height: 360,
    };
  }

  return {
    xAxis: [{ data: safeLabels }],
    series: [
      {
        data: seriesData,
        label: "Doanh thu",
      },
    ],
    height: 360,
  };
}
