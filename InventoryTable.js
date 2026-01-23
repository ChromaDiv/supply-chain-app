import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Configure in env as e.g. https://blue-fish-827279.hostingersite.com
    // Fallback is local dev backend.
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
    const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/inventory`;

    axios.get(API_URL)
      .then((response) => {
        setInventory(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory. Is the backend running?");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Inventory...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Supply Chain Inventory</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Reorder Point</th>
              <th className="px-6 py-3">Unit Cost</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.sku}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.current_stock}</td>
                <td className="px-6 py-4">{item.reorder_point}</td>
                <td className="px-6 py-4">${item.unit_cost.toFixed(2)}</td>
                <td className="px-6 py-4">
                  {item.current_stock <= item.reorder_point ? (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Low Stock</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;