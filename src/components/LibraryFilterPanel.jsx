import React from "react";

const activeFilterCount = (filters) => {
  let count = 0;

  if (filters.searchTerm) count += 1;
  if (filters.fileType) count += 1;
  if (filters.tags?.length) count += 1;
  if (filters.sortBy !== "createdAt") count += 1;
  if (filters.sortOrder !== "desc") count += 1;

  return count;
};

function LibraryFilterPanel({ filters, onFilterChange, availableTags, onReset }) {
  const count = activeFilterCount(filters);

  const handleInputChange = (event) => {
    onFilterChange(event.target.name, event.target.value);
  };

  const handleTagsChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    onFilterChange("tags", selectedOptions);
  };

  return (
    <section
      id="filter-panel"
      className="soft-panel rounded-[26px] p-4 sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 border-b border-[var(--line-soft)] pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="eyebrow">Filtros</span>
          <h3 className="mt-2 text-lg text-[var(--text-main)]">Refinar vista</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text-muted)] shadow-sm">
            {count} activo{count === 1 ? "" : "s"}
          </span>
          <button type="button" onClick={onReset} className="app-button-ghost !min-h-[40px] !px-4 !py-2 text-sm">
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.72fr))]">
        <div>
          <label htmlFor="searchTerm" className="field-label">
            Buscar por nombre o descripción
          </label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            placeholder="Ej: atlas torax, protocolo, informe..."
            className="app-input"
          />
        </div>

        <div>
          <label htmlFor="fileType" className="field-label">
            Tipo de recurso
          </label>
          <select
            id="fileType"
            name="fileType"
            value={filters.fileType}
            onChange={handleInputChange}
            className="app-select"
          >
            <option value="">Todos</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="pptx">PowerPoint</option>
            <option value="image">Imagen</option>
            <option value="video_link">Enlace video</option>
            <option value="generic_link">Enlace externo</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortBy" className="field-label">
            Ordenar por
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="app-select"
          >
            <option value="createdAt">Más reciente</option>
            <option value="filename">Nombre</option>
          </select>
        </div>

        <div>
          <label htmlFor="sortOrder" className="field-label">
            Dirección
          </label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleInputChange}
            className="app-select"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        {availableTags && availableTags.length > 0 ? (
          <div>
            <label htmlFor="tags" className="field-label">
              Etiquetas
            </label>
            <select
              id="tags"
              name="tags"
              multiple
              value={filters.tags}
              onChange={handleTagsChange}
              className="app-select min-h-[152px]"
            >
              {availableTags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[var(--line-soft)] bg-white/60 p-4 text-sm text-[var(--text-muted)]">
            Sin etiquetas disponibles.
          </div>
        )}
      </div>
    </section>
  );
}

export default LibraryFilterPanel;
