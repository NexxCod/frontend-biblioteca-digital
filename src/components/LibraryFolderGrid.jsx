import React from "react";
import LibraryFolderCard from "./LibraryFolderCard";

function LibraryFolderGrid({
  folders,
  isLoading,
  onFolderClick,
  onDeleteClick,
  onEditClick,
  user,
}) {
  if (isLoading && (!folders || folders.length === 0)) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[188px] animate-pulse rounded-[26px] bg-white/55"
          />
        ))}
      </div>
    );
  }

  if (!folders?.length) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {folders.map((folder) => (
        <LibraryFolderCard
          key={folder._id}
          folder={folder}
          onFolderClick={onFolderClick}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          user={user}
        />
      ))}
    </div>
  );
}

export default LibraryFolderGrid;
