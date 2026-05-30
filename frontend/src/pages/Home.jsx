import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ArrowRight } from "lucide-react";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const response = await api.get("/items?limit=6");
      setRecentItems(response.data.items.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <MapPin size={48} className="text-blue-200" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Lost & Found Hub</h1>
            <p className="text-xl text-blue-100 mb-8">
              Helping university students reconnect with lost items and find
              what they need
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/browse"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Search size={20} />
                Browse Items
              </Link>
              <Link
                to="/post"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center gap-2"
              >
                <ArrowRight size={20} />
                Post a Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                Recent Reports
              </h2>
              <p className="text-gray-600">
                Latest lost and found items on campus
              </p>
            </div>
            <Link
              to="/browse"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
            >
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading items...</p>
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <Link
                  key={item._id}
                  to={`/browse?id=${item._id}`}
                  className="no-underline"
                >
                  <ItemCard item={item} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No items found yet. Be the first to post!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <p className="text-gray-600">Items Posted</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <p className="text-gray-600">Recovery Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
