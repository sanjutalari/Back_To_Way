import React from "react";
import { MapPin, Calendar } from "lucide-react";

export default function ItemCard({ item }) {
  const getTypeStyles = (type) => {
    return type === "Lost"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusStyles = (status) => {
    return status === "Active"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative">
        {item.imagePath ? (
          <img
            src={`http://localhost:5001${item.imagePath}`}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {/* Type Badge */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold ${getTypeStyles(item.type)}`}
        >
          {item.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate mb-2">
          {item.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description || "No description provided"}
        </p>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="text-gray-500">Category:</span>
          <span className="font-semibold text-gray-700">{item.category}</span>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Posted:</span>
            <span className="text-xs text-gray-500">
              {formatDate(item.createdAt)}
            </span>
          </div>
          {item.incidentDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">
                Date {item.type === "Lost" ? "Lost" : "Found"}:
              </span>
              <span className="text-xs text-gray-600">
                {formatDate(item.incidentDate)}
              </span>
            </div>
          )}
        </div>

        {/* Tracking ID */}
        <div className="bg-blue-50 p-2 rounded mb-3">
          <span className="text-xs text-gray-600">Tracking ID: </span>
          <span className="text-sm font-mono font-bold text-blue-600">
            {item.trackingId}
          </span>
        </div>

        {/* Status */}
        <div
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusStyles(item.status)}`}
        >
          {item.status}
        </div>

        {/* User Info */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">
            <strong>Email:</strong> {item.userId?.email || "N/A"}
          </p>
          <p className="text-xs text-gray-600">
            <strong>Phone:</strong> {item.userId?.phone || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
