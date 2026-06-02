import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, CheckCircle, Edit } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user]);

  const fetchUserItems = async () => {
    try {
      const response = await api.get("/items/my-items");
      setUserItems(response.data.items);
    } catch (error) {
      console.error("Failed to fetch user items:", error);
      alert("Failed to load your reports");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (itemId, currentStatus) => {
    try {
      const response = await api.patch(`/items/${itemId}/resolve`);
      setUserItems((prev) =>
        prev.map((item) => (item._id === itemId ? response.data.item : item)),
      );
      alert(`Item status updated to ${response.data.item.status}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update item status");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      await api.delete(`/items/${itemId}`);
      setUserItems((prev) => prev.filter((item) => item._id !== itemId));
      alert("Item deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Please log in to view your dashboard
          </h2>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 inline-block transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome, {user.name}!</p>
          </div>
          <Link
            to="/post"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {userItems.filter((i) => i.status === "Active").length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Active Reports</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {userItems.filter((i) => i.status === "Resolved").length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Resolved Reports</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-700 transition-colors duration-300">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {userItems.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Reports</p>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden border border-transparent dark:border-gray-700 transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Reports</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Loading your reports...</p>
            </div>
          ) : userItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tracking ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.type === "Lost"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">
                        {item.trackingId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.status === "Active"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/edit/${item._id}`}
                            className="flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                          >
                            <Edit size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleResolve(item._id, item.status)}
                            className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors ${
                              item.status === "Active"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            <CheckCircle size={16} />
                            {item.status === "Active" ? "Resolve" : "Reopen"}
                          </button>
                          {item.status === "Resolved" && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No reports yet</p>
              <Link
                to="/post"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
              >
                Create your first report
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
