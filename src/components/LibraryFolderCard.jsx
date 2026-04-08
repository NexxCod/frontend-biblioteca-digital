import React from "react";
import { format } from "date-fns";

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 5a2 2 0 0 1 2-2h3.3a2 2 0 0 1 1.4.6l1.1 1.1a2 2 0 0 0 1.4.6H16a2 2 0 0 1 2 2v1H2V5Z" />
    <path d="M2 9h16v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="m13.5 3.6 2.9 2.9-8.8 8.8-3.8.9.9-3.8 8.8-8.8Z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.5 2a1 1 0 0 0-1 1V4H5a1 1 0 1 0 0 2h.1l.8 9.1A2 2 0 0 0 7.9 17h4.2a2 2 0 0 0 2-1.9l.8-9.1H15a1 1 0 1 0 0-2h-2.5V3a1 1 0 0 0-1-1h-3ZM9.5 4V4h1V3h-1v1Z" clipRule="evenodd" />
  </svg>
);

function LibraryFolderCard({
  folder,
  onFolderClick,
  onDeleteClick,
  onEditClick,
  user,
}) {
  const isAdmin = user?.role === "admin";
  const isOwner = user && folder.createdBy && folder.createdBy._id === user._id;
  const canModify = isAdmin || isOwner;

  return (
    <article
      className="group soft-panel cursor-pointer rounded-[24px] p-4"
      onClick={() => onFolderClick(folder)}
      title={folder.name}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--warm-soft)] text-[var(--warm)]">
          <FolderIcon />
        </div>
        {canModify && (
          <div className="flex items-center gap-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
            {onEditClick && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEditClick(folder, "folder");
                }}
                className="rounded-full bg-white p-2 text-[var(--brand)] shadow-sm"
              >
                <PencilIcon />
              </button>
            )}
            {onDeleteClick && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteClick(folder, "folder");
                }}
                className="rounded-full bg-white p-2 text-[#8e2b2b] shadow-sm"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="line-clamp-2 text-[15px] font-semibold text-[var(--text-main)]">
        {folder.name}
      </h3>
      <p className="mt-1.5 text-xs text-[var(--text-muted)]">
        {folder.createdBy?.username || "desconocido"} ·{" "}
        {folder.createdAt
          ? format(new Date(folder.createdAt), "dd/MM/yyyy")
          : "Sin fecha"}
      </p>
    </article>
  );
}

export default LibraryFolderCard;
