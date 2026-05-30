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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please log in to view your dashboard
          </h2>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>
          <Link
            to="/post"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userItems.filter((i) => i.status === "Active").length}
            </div>
            <p className="text-gray-600">Active Reports</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userItems.filter((i) => i.status === "Resolved").length}
            </div>
            <p className="text-gray-600">Resolved Reports</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {userItems.length}
            </div>
            <p className="text-gray-600">Total Reports</p>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Loading your reports...</p>
            </div>
          ) : userItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tracking ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.type === "Lost"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-blue-600">
                        {item.trackingId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/edit/${item._id}`}
                            className="flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Edit size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleResolve(item._id, item.status)}
                            className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors ${
                              item.status === "Active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <CheckCircle size={16} />
                            {item.status === "Active" ? "Resolve" : "Reopen"}
                          </button>
                          {item.status === "Resolved" && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="flex items-center gap-1 px-3 py-1 rounded font-semibold transition-colors bg-red-100 text-red-700 hover:bg-red-200"
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
              <p className="text-gray-600 mb-4">No reports yet</p>
              <Link
                to="/post"
                className="text-blue-600 hover:text-blue-800 font-semibold"
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
