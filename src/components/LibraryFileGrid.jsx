import React from "react";
import LibraryFileCard from "./LibraryFileCard";

function LibraryFileGrid({
  files,
  isLoading,
  showEmptyMessage,
  emptyMessage = "Esta carpeta aún no tiene archivos o enlaces.",
  onDeleteClick,
  onEditClick,
  user,
}) {
  if (isLoading && (!files || files.length === 0)) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[264px] animate-pulse rounded-[26px] bg-white/55"
          />
        ))}
      </div>
    );
  }

  if (!isLoading && (!files || files.length === 0) && showEmptyMessage) {
    return (
      <div className="rounded-[26px] border border-dashed border-[var(--line-soft)] bg-white/55 px-6 py-10 text-center text-[var(--text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  if (!files?.length) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <LibraryFileCard
          key={file._id}
          file={file}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          user={user}
        />
      ))}
    </div>
  );
}

export default LibraryFileGrid;
