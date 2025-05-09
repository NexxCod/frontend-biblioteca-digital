// src/components/FilterPanel.jsx
import React from 'react';

// El icono SearchIcon podría vivir aquí o en un archivo de iconos compartido
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function FilterPanel({
  filters, // Objeto: { searchTerm, fileType, tags, sortBy, sortOrder }
  onFilterChange, // Función para actualizar un filtro: (filterName, value) => void
  availableTags, // Array de etiquetas para el selector
  // isFilterPanelOpen, // Ya no es necesario aquí, HomePage maneja la visibilidad
  // handleToggleFilterPanel // Ya no es necesario aquí
}) {

  const handleInputChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    onFilterChange('tags', selectedOptions);
  };

  return (
    <div
      id="filter-panel"
      className="mb-6 p-3 bg-gray-100 rounded-lg shadow-sm flex flex-wrap gap-4 items-end transition-all duration-300 ease-in-out" // items-end para alinear mejor los labels con inputs/selects si tienen alturas variables
    >
      {/* Buscar */}
      <div className="flex-grow min-w-[150px] sm:max-w-[250px]">
        <label htmlFor="searchTerm" className="block text-xs font-medium text-gray-700 mb-1">Buscar:</label>
        <input
          type="text"
          id="searchTerm"
          name="searchTerm" // Coincide con la clave en el objeto filters
          value={filters.searchTerm}
          onChange={handleInputChange}
          placeholder="Nombre, descripción..."
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" // Ajustado py y text size
        />
      </div>

      {/* Tipo de Archivo */}
      <div className="min-w-[120px]">
        <label htmlFor="fileType" className="block text-xs font-medium text-gray-700 mb-1">Tipo:</label>
        <select
          id="fileType"
          name="fileType" // Coincide con la clave
          value={filters.fileType}
          onChange={handleInputChange}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option value="">Todos</option>
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
          <option value="excel">Excel</option>
          <option value="pptx">PowerPoint</option>
          <option value="image">Imagen</option>
          <option value="video_link">Enlace Video</option>
          <option value="generic_link">Enlace Genérico</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Etiquetas */}
      {availableTags && availableTags.length > 0 && (
        <div className="min-w-[150px]">
          <label htmlFor="tags" className="block text-xs font-medium text-gray-700 mb-1">Etiquetas:</label>
          <select
            id="tags"
            name="tags" // Coincide con la clave
            multiple
            value={filters.tags} // Espera un array de IDs
            onChange={handleTagsChange}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            size={availableTags.length > 4 ? 5 : availableTags.length + 1} // Ajusta el tamaño visible
          >
            {availableTags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ordenar por */}
      <div className="min-w-[130px]">
        <label htmlFor="sortBy" className="block text-xs font-medium text-gray-700 mb-1">Ordenar por:</label>
        <select
          id="sortBy"
          name="sortBy" // Coincide con la clave
          value={filters.sortBy}
          onChange={handleInputChange}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option value="createdAt">Fecha Creación</option>
          <option value="filename">Nombre</option>
        </select>
      </div>

      {/* Dirección de Orden */}
      <div className="min-w-[90px]">
        <label htmlFor="sortOrder" className="block text-xs font-medium text-gray-700 mb-1">Dirección:</label>
        <select
          id="sortOrder"
          name="sortOrder" // Coincide con la clave
          value={filters.sortOrder}
          onChange={handleInputChange}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;