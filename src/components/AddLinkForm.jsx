// frontend/src/components/AddLinkForm.jsx
import React from "react";

function AddLinkForm({
  linkUrl,
  setLinkUrl,
  linkTitle,
  setLinkTitle,
  linkDescription,
  setLinkDescription,
  linkTags,
  setLinkTags,
  linkGroupId,
  setLinkGroupId,
  groupsToShow,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="linkUrl" className="field-label">URL</label>
        <input
          type="url"
          id="linkUrl"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          required
          placeholder="https://ejemplo.com"
          className="app-input"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="linkTitle" className="field-label">Título</label>
        <input
          type="text"
          id="linkTitle"
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
          required
          className="app-input"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="linkDesc" className="field-label">Descripción</label>
        <textarea
          id="linkDesc"
          value={linkDescription}
          onChange={(e) => setLinkDescription(e.target.value)}
          rows="2"
          className="app-textarea"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="linkTags" className="field-label">Etiquetas</label>
        <input
          type="text"
          id="linkTags"
          value={linkTags}
          onChange={(e) => setLinkTags(e.target.value)}
          placeholder="Separadas por coma"
          className="app-input"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="linkGroup" className="field-label">Grupo</label>
        <select
          id="linkGroup"
          value={linkGroupId}
          onChange={(e) => setLinkGroupId(e.target.value)}
          className="app-select"
        >
          <option value="">Público</option>
          {groupsToShow?.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="status-error mb-3">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="app-button-ghost"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`app-button-primary ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Guardando..." : "Guardar enlace"}
        </button>
      </div>
    </form>
  );
}

export default AddLinkForm;
