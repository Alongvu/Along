// sold-pie-chart.js
export default function soldPieChart(data = []) {
  // Ensure each data item has id and value fields which PieChart expects.
  const safeData = data.map((d, idx) => ({
    id: d.id ?? d.label ?? String(idx),
    label: d.label ?? d.id ?? String(d.id ?? idx),
    value: Number(d.value ?? d.y ?? d.value) || 0,
  }));

  return {
    series: [
      {
        data: safeData,
        innerRadius: 50,
        outerRadius: 130,
      },
    ],
    width: 320,
    height: 320,
  };
}
