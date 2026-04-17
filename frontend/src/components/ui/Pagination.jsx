import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 */
export function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">
            1
          </button>
          {startPage > 2 && <span className="text-slate-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-[#9B1C1C] text-white'
              : 'hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <span className="ml-4 text-sm text-slate-600">
        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </span>
    </div>
  );
}

/**
 * Filter Bar Component
 */
export function FilterBar({ filters, onFilterChange, filterOptions, isLoading = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterOptions.map((option) => (
          <div key={option.key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">{option.label}</label>
            <select
              value={filters[option.key] || ''}
              onChange={(e) => onFilterChange(option.key, e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B1C1C] disabled:opacity-50"
            >
              <option value="">All {option.label}</option>
              {option.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Search Bar Component
 */
export function SearchBar({ value, onChange, placeholder = 'Search...', isLoading = false }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B1C1C] disabled:opacity-50"
      />
    </div>
  );
}

/**
 * Sorting Select Component
 */
export function SortSelect({ value, onChange, options, isLoading = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B1C1C] disabled:opacity-50 font-medium"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Results Summary Component
 */
export function ResultsSummary({ total, page, limit, isLoading = false }) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <p className="text-sm text-slate-600 mb-4">
      {isLoading ? 'Loading...' : `Showing ${start}-${end} of ${total} results`}
    </p>
  );
}
