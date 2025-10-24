
import React from 'react';

const Sidebar = ({ categories, selected, onSelect }) => {
  return (
    <div className="list-group">
      <button
        className={`list-group-item ${selected === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All Categories
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`list-group-item ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;





