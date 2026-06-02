import React from "react";
import { MapPin, Calendar } from "lucide-react";
import { apiOrigin } from "../api/axios";

export default function ItemCard({ item }) {
  const getTypeStyles = (type) => {
    return type === "Lost"
      ? "bg-red-50 text-red-600 border border-red-100 shadow-sm"
      : "bg-green-50 text-green-600 border border-green-100 shadow-sm";
  };

  const getStatusStyles = (status) => {
    return status === "Active"
      ? "bg-blue-50 text-blue-600 border border-blue-100"
      : "bg-gray-50 text-gray-600 border border-gray-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden">
        {item.imagePath ? (
          <img
            src={`${apiOrigin}${item.imagePath}`}
            alt={item.title}
            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 ease-out">
            <span className="text-gray-400 text-sm font-medium">No image provided</span>
          </div>
        )}
        {/* Type Badge */}
        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md ${getTypeStyles(item.type)}`}
        >
          {item.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 truncate mb-2 group-hover:text-blue-600 transition-colors">
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
        <div className="bg-blue-50/50 p-3 rounded-xl mb-4 border border-blue-100/50 mt-auto">
          <span className="text-xs text-gray-500 font-medium">Tracking ID: </span>
          <span className="text-sm font-mono font-bold text-blue-600">
            {item.trackingId}
          </span>
        </div>

        {/* Status */}
        <div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusStyles(item.status)}`}
          >
            {item.status}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">
            <strong>Email:</strong> {item.user?.email || "N/A"}
          </p>
          <p className="text-xs text-gray-600">
            <strong>Phone:</strong> {item.user?.phone || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
