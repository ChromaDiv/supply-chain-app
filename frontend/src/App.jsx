import { useEffect, useState } from "react";
import axios from "axios";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [deliveryNotice, setDeliveryNotice] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Delete this SKU?")) {
      await axios.delete(`http://127.0.0.1:8000/products/${id}`);
      setInventory(inventory.filter((i) => i.id !== id));
    }
  };

  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    current_stock: 0,
    reorder_point: 0,
    unit_cost: 0,
    supplier_id: 1,
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await axios.post("http://127.0.0.1:8000/products", newProduct);
    const res = await axios.get("http://127.0.0.1:8000/inventory");
    setInventory(res.data);
    setNewProduct({
      sku: "",
      name: "",
      current_stock: 0,
      reorder_point: 0,
      unit_cost: 0,
      supplier_id: 1,
    });
  };

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = {
    labels: inventory.map((item) => item.name),
    datasets: [
      {
        label: "Current Stock",
        data: inventory.map((item) => item.current_stock),
        backgroundColor: "rgba(59, 130, 246, 0.8)", // Blue
      },
      {
        label: "Reorder Point",
        data: inventory.map((item) => item.reorder_point),
        backgroundColor: "rgba(239, 68, 68, 0.8)", // Red
      },
    ],
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/inventory")
      .then((res) => {
        setInventory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Connection Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Loading Inventory Data...</div>;

  const handleReorder = async (productId) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/reorder", {
        product_id: productId,
        quantity: 50,
      });

      // Refresh data
      const response = await axios.get("http://127.0.0.1:8000/inventory");
      setInventory(response.data);

      // Set a temporary notice
      setDeliveryNotice(`Order confirmed! Estimated arrival: ${res.data.eta}`);
      setTimeout(() => setDeliveryNotice(""), 5000); // Hide after 5 seconds
    } catch (err) {
      console.error("Order failed", err);
    }
  };

  return (
    <div className="p-10 font-sans">
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">
          INVENTORY HEALTH DASHBOARD
        </h1>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 m-[5%] my-10">
          <h2 className="text-lg font-bold mb-4 text-slate-700">
            Stock Levels vs. Reorder Points
          </h2>
          <div className="h-64">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <form
          onSubmit={handleAddProduct}
          className="bg-slate-50 p-6 rounded-lg mb-8 grid grid-cols-2 md:grid-cols-7 gap-4 border border-slate-200 m-[5%] my-10 shadow-lg"
        >
          <input
            className="border p-2 rounded"
            placeholder="SKU"
            value={newProduct.sku}
            onChange={(e) =>
              setNewProduct({ ...newProduct, sku: e.target.value })
            }
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Stock"
            value={newProduct.current_stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, current_stock: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Reorder Pt"
            value={newProduct.reorder_point}
            onChange={(e) =>
              setNewProduct({ ...newProduct, reorder_point: e.target.value })
            }
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Cost"
            value={newProduct.unit_cost}
            onChange={(e) =>
              setNewProduct({ ...newProduct, unit_cost: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Lead Time (Days)"
            className="border p-2 rounded"
            onChange={(e) =>
              setFormData({ ...formData, lead_time_days: e.target.value })
            }
          />
          <button
            type="submit"
            className="bg-green-600 text-white font-bold rounded hover:bg-green-700"
          >
            Add SKU
          </button>
        </form>

        {deliveryNotice && (
          <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 animate-bounce shadow-lg flex justify-between">
            <span>{deliveryNotice}</span>
            <button onClick={() => setDeliveryNotice("")}>✕</button>
          </div>
        )}

        <div className="flex justify-center items-center min-w-[90%] mx-[5%] my-10">
          <div className="min-w-full rounded-lg overflow-hidden shadow-lg border border-gray-300">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Reorder Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Projected Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  // Force everything to be a Number for a clean comparison
                  const stock = Number(item.current_stock);
                  const point = Number(item.reorder_point);

                  // The logic: If stock is LESS THAN OR EQUAL to reorder point, it's a crisis
                  const isLowStock = stock <= point;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-300 transition-colors ${
                        isLowStock ? "bg-red-100" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-6 py-4 font-mono">{item.sku}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td
                        className={`px-6 py-4 font-bold ${
                          isLowStock ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        {item.current_stock}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.reorder_point}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.next_delivery ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                            📦{" "}
                            {new Date(item.next_delivery).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">
                            ⚠️ LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            ✅ HEALTHY
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleReorder(item.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Reorder
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold  "
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-[5%] my-10">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-sm text-slate-500 uppercase font-bold">
              Total SKUs
            </p>
            <p className="text-2xl font-bold">{inventory.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-sm text-slate-500 uppercase font-bold">
              Items to Reorder
            </p>
            <p className="text-2xl font-bold">
              {
                inventory.filter(
                  (i) => Number(i.current_stock) <= Number(i.reorder_point)
                ).length
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-sm text-slate-500 uppercase font-bold">
              Inventory Value
            </p>
            <p className="text-2xl font-bold">
              $
              {inventory
                .reduce(
                  (acc, i) =>
                    acc + Number(i.current_stock) * Number(i.unit_cost),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
