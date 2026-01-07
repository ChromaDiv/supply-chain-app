import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import InventoryTable from "./components/InventoryTable";
import AddProductForm from "./components/AddProductForm";
import SupplierList from "./components/SupplierList";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // State for suppliers
  const [loading, setLoading] = useState(true);

  // --- DATA ACTIONS ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // Combined fetch to ensure Dashboard gets everything at once
  const fetchAllData = async () => {
    try {
      const [invRes, supRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/inventory"),
        axios.get("http://127.0.0.1:8000/suppliers"),
      ]);

      setInventory(invRes.data);
      setSuppliers(supRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Connection Error:", err);
      setLoading(false);
    }
  };

  // Handle reorder action
  const handleReorder = async (productId) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/reorder", {
        product_id: productId,
        quantity: 50, // Default reorder quantity as shown in UI
      });

      // Refresh inventory after successful reorder
      fetchAllData();

      // Show success message if ETA is returned
      if (response.data.eta) {
        alert(`Reorder successful! Expected delivery: ${response.data.eta}`);
      } else if (response.data.message) {
        alert(response.data.message);
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      alert("Error: Failed to process reorder. Please try again.");
    }
  };

  // Handle delete product action
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/products/${productId}`);
        fetchAllData();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Error: Failed to delete product.");
      }
    }
  };

  // --- EXPORT FEATURE ---
  const exportToCSV = () => {
    const headers = "SKU,Name,Stock,ReorderPoint,UnitCost,TotalValue\n";
    const rows = inventory
      .map(
        (i) =>
          `${i.sku},${i.name},${i.current_stock},${i.reorder_point},${
            i.unit_cost
          },${Number(i.current_stock) * Number(i.unit_cost)}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `Inventory_Report_${new Date().toLocaleDateString()}.csv`
    );
    a.click();
  };

  // --- CHART LOGIC ---
  const chartData = {
    labels: inventory.map((item) => item.name),
    datasets: [
      {
        label: "Stock Level",
        data: inventory.map((item) => item.current_stock),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Safety Limit",
        data: inventory.map((item) => item.reorder_point),
        backgroundColor: "#ef4444",
      },
    ],
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="font-bold text-blue-900 uppercase tracking-widest text-xs">
            Initialising Supply Chain Systems...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* --- NAV BAR --- */}
      <nav className="bg-blue-900 p-4 shadow-xl flex flex-col md:flex-row justify-between items-center px-[5%] gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-blue-900 font-black italic">
            SCM
          </div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tighter">
            Inventory Hub
          </h1>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["dashboard", "inventory", "suppliers", "add"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition uppercase tracking-tight ${
                activeTab === tab
                  ? "bg-white text-blue-900 shadow-lg"
                  : "text-white hover:bg-blue-800"
              }`}
            >
              {tab === "dashboard"
                ? "Analytics"
                : tab === "add"
                ? "+ New SKU"
                : tab}
            </button>
          ))}
        </div>

        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg transition"
        >
          📊 Export Report
        </button>
      </nav>

      {/* --- CONTENT AREA --- */}
      <div className="py-10">
        {activeTab === "dashboard" && (
          <Dashboard
            inventory={inventory}
            chartData={chartData}
            suppliers={suppliers}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTable
            inventory={inventory}
            onReorder={handleReorder}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "suppliers" && <SupplierList />}

        {activeTab === "add" && (
          <AddProductForm
            onProductAdded={() => {
              fetchAllData();
              setActiveTab("inventory");
            }}
          />
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="fixed bottom-0 w-full bg-white border-t px-[5%] py-2 flex justify-between text-[10px] text-slate-400 font-bold uppercase">
        <span>
          System Status:{" "}
          <span className="text-green-600 font-black">● Operational</span>
        </span>
        <span>
          Connected: {inventory.length} active SKUs | {suppliers.length}{" "}
          Partners
        </span>
      </footer>
    </div>
  );
}

export default App;
