import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";

const typeLabels = {
  pdf: "PDF",
  word: "Documento",
  excel: "Planilla",
  pptx: "Presentación",
  image: "Imagen",
  video_link: "Link video",
  generic_link: "Enlace",
  video: "Video",
  audio: "Audio",
  other: "Archivo",
};

const FileIcon = ({ fileType }) => {
  const toneMap = {
    pdf: "text-[#b84532] bg-[#f6ddd6]",
    image: "text-[#236158] bg-[#dbece7]",
    word: "text-[#1f4a87] bg-[#dbe7f7]",
    video_link: "text-[#8b4f2e] bg-[#f4e1d5]",
    generic_link: "text-[#5b6f68] bg-[#edf1ee]",
    video: "text-[#8b4f2e] bg-[#f4e1d5]",
    audio: "text-[#355f63] bg-[#dfeff1]",
    other: "text-[var(--text-muted)] bg-[#edf1ee]",
  };

  const tone = toneMap[fileType] || toneMap.other;

  return (
    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.4a2 2 0 0 0-.6-1.4l-3.4-3.4A2 2 0 0 0 10.6 2H6Z" />
      </svg>
    </span>
  );
};

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

const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return "0 KB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function LibraryFileCard({ file, onDeleteClick, onEditClick, user }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const isAdmin = user?.role === "admin";
  const isOwner = user && file.uploadedBy && file.uploadedBy._id === user._id;
  const canModify = isAdmin || isOwner;
  const isLink =
    file.fileType === "video_link" || file.fileType === "generic_link";
  const tooltipId = `library-file-${file._id}`;

  const detailHtml = useMemo(() => {
    const tags =
      file.tags?.length > 0 ? file.tags.map((tag) => tag.name).join(", ") : "Ninguna";

    return `
      <div style="max-width: 240px;">
        <p><strong>Tipo:</strong> ${typeLabels[file.fileType] || "Archivo"}</p>
        <p><strong>Subido por:</strong> ${file.uploadedBy?.username || "Desconocido"}</p>
        <p><strong>Fecha:</strong> ${
          file.createdAt ? format(new Date(file.createdAt), "dd/MM/yyyy HH:mm") : "N/A"
        }</p>
        <p><strong>Etiquetas:</strong> ${tags}</p>
        <p><strong>Descripción:</strong> ${file.description || "Sin descripción"}</p>
      </div>
    `;
  }, [file]);

  const handleOpen = async (event) => {
    if (
      !file.secureUrl ||
      file.fileType === "video_link" ||
      file.fileType === "generic_link"
    ) {
      return;
    }

    event.preventDefault();
    setIsDownloading(true);
    setDownloadError("");

    try {
      window.open(file.secureUrl, "_blank");
    } catch (_error) {
      setDownloadError("No se pudo abrir el archivo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="group soft-panel flex h-full flex-col rounded-[22px] p-3.5 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <FileIcon fileType={file.fileType} />
          <div>
            <p className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)] shadow-sm">
              {typeLabels[file.fileType] || "Archivo"}
            </p>
            {!isLink && (
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
                {formatBytes(file.size || 0)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full bg-white p-2 text-[var(--brand)] shadow-sm"
            data-tooltip-id={tooltipId}
            data-tooltip-html={detailHtml}
            data-tooltip-place="top"
          >
            i
          </button>
          {canModify && onEditClick && (
            <button
              type="button"
              onClick={() => onEditClick(file, "file")}
              className="rounded-full bg-white p-2 text-[var(--brand)] shadow-sm opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
            >
              <PencilIcon />
            </button>
          )}
          {canModify && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(file, "file")}
              className="rounded-full bg-white p-2 text-[#8e2b2b] shadow-sm opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="line-clamp-2 text-[15px] font-semibold text-[var(--text-main)]">
          {file.filename}
        </h3>
        {file.description && (
          <p className="mt-1 line-clamp-1 text-sm text-[var(--text-muted)]">
            {file.description}
          </p>
        )}
        {file.folder?.name && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-soft)]">
            {file.folder.name}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {file.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag._id || tag.name}
              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] shadow-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3.5 border-t border-[var(--line-soft)] pt-2.5">
        <p className="text-xs text-[var(--text-muted)]">
          {file.uploadedBy?.username || "Desconocido"} ·{" "}
          {file.createdAt
            ? format(new Date(file.createdAt), "dd/MM/yyyy")
            : "Sin fecha"}
        </p>
        {downloadError && (
          <p className="mt-2 text-sm text-[#8e2b2b]">{downloadError}</p>
        )}
        {isLink ? (
          <a
            href={file.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]"
          >
            Abrir enlace
          </a>
        ) : (
          <a
            href={file.secureUrl}
            rel="noopener noreferrer"
            onClick={file.secureUrl ? handleOpen : (event) => event.preventDefault()}
            target={file.secureUrl ? "_blank" : undefined}
            className="mt-2.5 inline-flex text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]"
          >
            {isDownloading ? "Abriendo..." : "Abrir archivo"}
          </a>
        )}
      </div>

      <Tooltip id={tooltipId} className="tooltip-on-top" />
    </article>
  );
}

export default LibraryFileCard;
