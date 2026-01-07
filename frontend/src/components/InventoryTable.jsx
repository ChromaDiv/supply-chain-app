import { useState } from "react";

export default function InventoryTable({ inventory, onReorder, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredData = inventory.filter((item) => {
    const stock = Number(item.current_stock);
    const point = Number(item.reorder_point);
    const isLow = stock <= point;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesToggle = filterLowStock ? isLow : true;
    return matchesSearch && matchesToggle;
  });

  return (
    <div className="mx-[4%] md:mx-[5%] animate-in slide-in-from-bottom-4 duration-500">
      {/* --- CONTROL BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search SKUs or Products..."
            className="p-3 pl-10 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer group w-full md:w-auto justify-center bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            <div
              className={`w-10 h-6 rounded-full transition ${
                filterLowStock ? "bg-red-500" : "bg-slate-300"
              }`}
            ></div>
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                filterLowStock ? "translate-x-4" : ""
              }`}
            ></div>
          </div>
          <span className="text-sm font-bold text-slate-600">
            Show Low Stock Only
          </span>
        </label>
      </div>

      {/* --- RESPONSIVE CONTAINER --- */}
      <div className="shadow-xl rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* DESKTOP TABLE VIEW (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Stock Level</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Reorder Cost</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs font-mono text-blue-500">
                      {item.sku}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-lg font-bold ${
                        Number(item.current_stock) <= Number(item.reorder_point)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.current_stock}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Limit: {item.reorder_point}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        Number(item.current_stock) <= Number(item.reorder_point)
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {Number(item.current_stock) <= Number(item.reorder_point)
                        ? "Critically Low"
                        : "Stable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="font-bold text-slate-700">
                      ${(Number(item.unit_cost) * 50).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">for 50 units</p>
                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-center items-center">
                    <button
                      onClick={() => onReorder(item.id)}
                      className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-bold shadow-md hover:bg-blue-700"
                    >
                      Reorder
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-slate-300 hover:text-red-600 text-2xl"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Shown only on small screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {item.name}
                    </h3>
                    <p className="text-xs font-mono text-blue-500">
                      {item.sku}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Stock Level
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        Number(item.current_stock) <= Number(item.reorder_point)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.current_stock}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        / {item.reorder_point}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Reorder Cost
                    </p>
                    <p className="font-bold text-slate-700">
                      ${(Number(item.unit_cost) * 50).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onReorder(item.id)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md"
                  >
                    Reorder Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 italic">
              No items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
