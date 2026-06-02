import React, { useState, useEffect } from "react";
import { Search, Filter, Layers } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-12 pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Browse Registry</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Search our global database of lost and found devices.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
            </div>
            <input
              type="text"
              placeholder="Search items by title, tracking ID, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 dark:text-white placeholder-gray-400 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-28 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <Filter size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
              </div>

              {/* Type Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Report Type</h4>
                <div className="space-y-3">
                  {["Lost", "Found"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedType === type ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                        {selectedType === type && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedType === type}
                        onChange={() => handleTypeFilter(type)}
                        className="hidden"
                      />
                      <span className={`font-medium transition-colors ${selectedType === type ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Category</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === category ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                        {selectedCategory === category && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryFilter(category)}
                        className="hidden"
                      />
                      <span className={`font-medium transition-colors ${selectedCategory === category ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading items...</p>
              </div>
            ) : items.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{items.length}</span> result{items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <motion.div key={item._id} variants={itemVariants}>
                      <ItemCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="bg-gray-50 dark:bg-gray-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <p className="text-gray-900 dark:text-white text-xl font-bold mb-2">
                  No matches found
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or clearing your filters.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
