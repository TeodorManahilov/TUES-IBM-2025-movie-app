import React from 'react';

const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'movie', label: 'Movies' },
    { key: 'series', label: 'TV Series' },
    { key: 'favorites', label: 'Favorites' },
    { key: 'watchlist', label: 'Watchlist' }
  ];

  return (
    <div className="filter-tabs">
      {filters.map(filter => (
        <button
          key={filter.key}
          className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;