"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Power,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Cookies from "js-cookie";
import { useEffect } from "react";

interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  no_of_seats: number;
  status: "Active" | "Inactive";
  driver?: {
    name: string;
  } | null;
}

export default function VehicleListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("access_token");
        const response = await fetch("http://localhost:3000/vehicles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        const data = await response.json();
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (err) {
        setVehicles([]);
        setFilteredVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleFilter = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.driver?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((vehicle) => vehicle.status === selectedStatus);
    }

    if (selectedType) {
      filtered = filtered.filter((vehicle) => vehicle.type === selectedType);
    }

    setFilteredVehicles(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRoute("");
    setSelectedStatus("");
    setSelectedType("");
    setFilteredVehicles(vehicles);
    setCurrentPage(1);
  };

  const StatusBadge: React.FC<{ status: Vehicle["status"] }> = ({ status }) => {
    return (
      <Badge
        variant="secondary"
        className={
          status === "Active"
            ? "bg-[var(--success-bg)] text-[var(--success-green)]"
            : "bg-[var(--light-gray)] text-[var(--neutral-gray)]"
        }
      >
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-[var(--color-deep-navy)] text-lg font-semibold">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Vehicle List</h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Manage and view all your vehicles
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
            />
          </div>

          {/* Route Filter */}
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
          >
            <option value="">All Routes</option>
            <option value="Route A">Route A</option>
            <option value="Route B">Route B</option>
            <option value="Route C">Route C</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg focus:ring-2 focus:ring-[var(--bright-orange)] focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Bus">Bus</option>
            <option value="Mini Bus">Mini Bus</option>
            <option value="Van">Van</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleFilter}
              className="border-[var(--neutral-gray)] text-[var(--color-deep-navy)] hover:bg-[var(--light-gray)]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Additional Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={clearFilters}
            className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-[var(--neutral-gray)] text-[var(--color-deep-navy)] hover:bg-[var(--light-gray)]"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[var(--light-gray)] border-b border-[var(--neutral-gray)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Vehicle No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Assigned Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--neutral-gray)]">
              {currentVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="hover:bg-[var(--light-gray)] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-deep-navy)]">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--neutral-gray)]">
                    {vehicle.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--neutral-gray)]">
                    {vehicle.no_of_seats} passengers
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--neutral-gray)]">
                    {vehicle.driver?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={
                          vehicle.status === "Active"
                            ? "text-[var(--error-red)] hover:text-[var(--warning-amber)]"
                            : "text-[var(--success-green)] hover:text-[var(--warm-yellow)]"
                        }
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button className="text-[var(--neutral-gray)] hover:text-[var(--color-deep-navy)]">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[var(--neutral-gray)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--neutral-gray)]">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of{" "}
                {filteredVehicles.length} vehicles
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--bright-orange)] hover:text-[var(--black)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${currentPage === page
                      ? "bg-[var(--color-deep-navy)] text-white"
                      : "text-[var(--bright-orange)] hover:bg-[var(--color-deep-navy)] hover:text-white"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--bright-orange)] hover:text-[var(--black)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--neutral-gray)]">No vehicles found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}