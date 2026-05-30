import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(null); // null = both, 'Lost' = Lost, 'Found' = Found
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (keyword = "", type = null, category = "") => {
    setLoading(true);
    try {
      let url = "/items/search?";
      const params = new URLSearchParams();

      if (keyword) params.append("keyword", keyword);
      if (type) params.append("type", type);
      if (category) params.append("category", category);

      const response = await api.get(url + params.toString());
      setItems(response.data.items);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchItems(term, selectedType, selectedCategory);
  };

  const handleTypeFilter = (type) => {
    const newType = selectedType === type ? null : type;
    setSelectedType(newType);
    fetchItems(searchTerm, newType, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
    fetchItems(searchTerm, selectedType, newCategory);
  };

  const categories = [
    "Electronics",
    "Documents",
    "Keys",
    "Clothing",
    "Accessories",
    "Books",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Items</h1>
        <p className="text-gray-600 mb-8">
          Search through all lost and found reports
        </p>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items by title or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-700" />
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Item Type</h4>
                <div className="space-y-2">
                  {["Lost", "Found"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedType === type}
                        onChange={() => handleTypeFilter(type)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryFilter(category)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading items...</p>
              </div>
            ) : items.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6 font-semibold">
                  Found {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">
                  No items found matching your search
                </p>
                <p className="text-gray-400 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
