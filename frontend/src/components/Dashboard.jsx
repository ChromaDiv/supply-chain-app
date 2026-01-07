import { Bar } from "react-chartjs-2";

export default function Dashboard({ inventory, chartData, suppliers = [] }) {
  // --- BUSINESS LOGIC ---
  const criticalItem = [...inventory]
    .filter((i) => Number(i.current_stock) <= Number(i.reorder_point))
    .sort(
      (a, b) =>
        Number(a.reorder_point) -
        Number(a.current_stock) -
        (Number(b.reorder_point) - Number(b.current_stock))
    )
    .reverse()[0];

  const riskyItems = inventory
    .map((item) => ({
      ...item,
      ratio:
        item.reorder_point > 0
          ? Number(item.current_stock) / Number(item.reorder_point)
          : 1,
    }))
    .sort((a, b) => a.ratio - b.ratio);

  const topRisk = riskyItems[0];

  const highValueItems = [...inventory]
    .map((item) => ({
      ...item,
      totalValue: Number(item.current_stock) * Number(item.unit_cost),
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const totalInventoryValue = inventory.reduce(
    (acc, i) => acc + Number(i.current_stock) * Number(i.unit_cost),
    0
  );

  const supplierChartData = {
    labels: suppliers.map((s) => s.name),
    datasets: [
      {
        label: "Lead Time (Days)",
        data: suppliers.map((s) => s.lead_time_days),
        backgroundColor: "#4f46e5",
        borderRadius: 12,
        barThickness: 20,
      },
    ],
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out pb-24 px-4 md:px-[5%] max-w-7xl mx-auto">
      {/* 1. TOP STATS: BENTO GRID STYLE */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
        {/* Value Card - Primary Focus */}
        <div className="col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-lg shadow-blue-200/50 text-white">
          <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">
            Global Assets
          </p>
          <p className="text-2xl md:text-3xl font-black mt-1">
            ${totalInventoryValue.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Live Value
            </span>
          </div>
        </div>

        {/* Priority Card */}
        <div className="col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Highest Shortfall
          </p>
          <div>
            <p className="text-lg font-bold text-slate-800 truncate leading-tight">
              {criticalItem ? criticalItem.name : "Healthy ✅"}
            </p>
            {criticalItem && (
              <p className="text-xs text-red-500 font-bold">
                Needs{" "}
                {Number(criticalItem.reorder_point) -
                  Number(criticalItem.current_stock)}{" "}
                Units
              </p>
            )}
          </div>
        </div>

        {/* Mini Stats */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
            SKUs
          </p>
          <p className="text-2xl font-black text-slate-800">
            {inventory.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1 text-red-500">
            Alerts
          </p>
          <p className="text-2xl font-black text-red-600">
            {
              inventory.filter(
                (i) => Number(i.current_stock) <= Number(i.reorder_point)
              ).length
            }
          </p>
        </div>
      </div>

      {/* 2. MAIN VISUALIZATION HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart Container */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
              Inventory Levels vs Thresholds
            </h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } } },
              }}
            />
          </div>
        </div>

        {/* Right Sidebar: High Value & Suppliers Combined */}
        <div className="space-y-6">
          {/* High Value List */}
          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-indigo-400">
              High-Value Assets
            </h2>
            <div className="space-y-4">
              {highValueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center group cursor-default"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400">
                      0{index + 1}
                    </span>
                    <span className="text-sm font-bold truncate max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-indigo-300">
                    $
                    {(
                      Number(item.current_stock) * Number(item.unit_cost)
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Mini Chart */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400 text-center">
              Supplier Speed
            </h2>
            <div className="h-[180px]">
              {suppliers.length > 0 ? (
                <Bar
                  data={supplierChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <p className="text-center text-[10px] text-slate-300 mt-10 italic">
                  Awaiting partner data...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
