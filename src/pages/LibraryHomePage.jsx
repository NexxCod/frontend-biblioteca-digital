import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import groupService from "../services/groupService";
import tagService from "../services/tagService";
import useFolderData from "../hooks/useFolderData";
import useDebouncedValue from "../hooks/useDebouncedValue";
import LibraryHeader from "../components/LibraryHeader";
import LibraryFolderGrid from "../components/LibraryFolderGrid";
import LibraryFileGrid from "../components/LibraryFileGrid";
import LibraryFilterPanel from "../components/LibraryFilterPanel";
import CreateFolderModal from "../components/Modals/CreateFolderModal";
import UploadFileModal from "../components/Modals/UploadFileModal";
import AddLinkModal from "../components/Modals/AddLinkModal";
import ConfirmDeleteModal from "../components/Modals/ConfirmDeleteModal";
import EditItemModal from "../components/Modals/EditItemModal";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.5 3a5.5 5.5 0 1 0 3.5 9.74l3.63 3.63a1 1 0 0 0 1.41-1.41l-3.63-3.63A5.5 5.5 0 0 0 8.5 3Z" clipRule="evenodd" />
  </svg>
);

const StatPill = ({ label, value }) => (
  <div className="rounded-full bg-white px-3 py-2 text-sm shadow-sm">
    <span className="font-semibold text-[var(--text-main)]">{value}</span>
    <span className="ml-1 text-[var(--text-muted)]">{label}</span>
  </div>
);

const countActiveFilters = ({ searchTerm, filterFileType, filterTags, sortBy, sortOrder }) => {
  let count = 0;
  if (searchTerm) count += 1;
  if (filterFileType) count += 1;
  if (filterTags.length) count += 1;
  if (sortBy !== "createdAt") count += 1;
  if (sortOrder !== "desc") count += 1;
  return count;
};

function LibraryHomePage() {
  const FILES_PAGE_SIZE = 24;
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { folderId: folderIdFromUrl } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350);

  const {
    currentFolder,
    subfolders,
    files,
    pagination,
    isLoading: isLoadingContent,
    error: contentError,
    refreshData,
    isGlobalFilesView,
  } = useFolderData(folderIdFromUrl, {
    searchTerm: debouncedSearchTerm,
    fileType: filterFileType,
    tags: filterTags,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: FILES_PAGE_SIZE,
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    const fetchRelevantGroups = async () => {
      if (user?.role === "admin") {
        try {
          const groupsData = await groupService.listGroups();
          setAvailableGroups(groupsData || []);
        } catch (_error) {
          setAvailableGroups([]);
        }
      } else if (user) {
        setAvailableGroups(user.groups || []);
      } else {
        setAvailableGroups([]);
      }
    };

    if (!isAuthLoading) {
      fetchRelevantGroups();
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    const fetchAllTags = async () => {
      if (!user || isAuthLoading || !isFilterPanelOpen || availableTags.length > 0) {
        return;
      }

      try {
        const tagsData = await tagService.listTags({ lite: true });
        setAvailableTags(tagsData || []);
      } catch (_error) {
        setAvailableTags([]);
      }
    };

    fetchAllTags();
  }, [user, isAuthLoading, isFilterPanelOpen, availableTags.length]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterFileType("");
    setFilterTags([]);
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  const handleFolderClick = useCallback(
    (folder) => {
      resetFilters();
      navigate(`/folder/${folder._id}`);
    },
    [navigate, resetFilters]
  );

  const handleBackClick = useCallback(() => {
    const parentId = currentFolder?.parentFolder || null;
    resetFilters();
    if (parentId) {
      navigate(`/folder/${parentId}`);
      return;
    }
    navigate("/");
  }, [currentFolder, navigate, resetFilters]);

  const openConfirmModal = useCallback((item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmModalOpen(true);
  }, []);

  const openEditModal = useCallback((item, type) => {
    setItemToEdit({ ...item, type });
    setIsEditModalOpen(true);
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    switch (filterName) {
      case "searchTerm":
        setSearchTerm(value);
        break;
      case "fileType":
        setFilterFileType(value);
        break;
      case "tags":
        setFilterTags(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
      case "sortOrder":
        setSortOrder(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [folderIdFromUrl]);

  useEffect(() => {
    if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  if (isAuthLoading && !user) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6 text-center">
          Cargando biblioteca...
        </div>
      </div>
    );
  }

  const mainTitle = currentFolder ? currentFolder.name : "Biblioteca digital";
  const canGoBack = Boolean(folderIdFromUrl);
  const groupsForForms = user?.role === "admin" ? availableGroups : user?.groups || [];
  const showEmptyFolderMessage =
    !isLoadingContent &&
    !contentError &&
    subfolders.length === 0 &&
    files.length === 0;
  const shouldShowFilesSection =
    !contentError && (Boolean(folderIdFromUrl || currentFolder) || isGlobalFilesView);
  const shouldShowFileGridEmptyMessage =
    !isLoadingContent &&
    !contentError &&
    (!files || files.length === 0) &&
    (folderIdFromUrl || currentFolder || isGlobalFilesView);
  const showPagination =
    !contentError &&
    (folderIdFromUrl || currentFolder || isGlobalFilesView) &&
    pagination.totalPages > 1;
  const hasActiveFilters =
    Boolean(searchTerm || filterFileType || filterTags.length || sortBy !== "createdAt" || sortOrder !== "desc");
  const activeFilterCount = countActiveFilters({
    searchTerm,
    filterFileType,
    filterTags,
    sortBy,
    sortOrder,
  });

  return (
    <div className="page-shell">
      <div className="space-y-6">
        <LibraryHeader
          canGoBack={canGoBack}
          handleBackClick={handleBackClick}
          currentFolderName={mainTitle}
          user={user}
          currentFolder={currentFolder}
          openCreateFolderModal={() => setIsCreateFolderModalOpen(true)}
          openUploadModal={() => setIsUploadModalOpen(true)}
          openAddLinkModal={() => setIsAddLinkModalOpen(true)}
          logout={logout}
        />

        <section className="glass-panel rounded-[26px] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <StatPill label="carpetas" value={subfolders.length} />
              <StatPill label="recursos" value={pagination.totalItems || files.length} />
              <StatPill label={activeFilterCount === 1 ? "filtro" : "filtros"} value={activeFilterCount} />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-[520px]">
              <label className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => handleFilterChange("searchTerm", event.target.value)}
                  placeholder={currentFolder ? "Buscar en esta carpeta" : "Buscar en toda la biblioteca"}
                  className="app-input app-input-with-icon"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                className="app-button-secondary whitespace-nowrap !min-h-[44px]"
              >
                {isFilterPanelOpen ? "Ocultar filtros" : "Filtros"}
              </button>
            </div>
          </div>
        </section>

        {contentError && <div className="status-error">{contentError}</div>}

        {isFilterPanelOpen && (
          <LibraryFilterPanel
            filters={{
              searchTerm,
              fileType: filterFileType,
              tags: filterTags,
              sortBy,
              sortOrder,
            }}
            onFilterChange={handleFilterChange}
            availableTags={availableTags}
            onReset={resetFilters}
          />
        )}

        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-[var(--line-soft)] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-main)]">
                {currentFolder ? "Subcarpetas de trabajo" : "Estructura principal"}
              </h3>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text-muted)] shadow-sm">
              {subfolders.length} carpeta{subfolders.length === 1 ? "" : "s"}
            </div>
          </div>

          <LibraryFolderGrid
            folders={subfolders}
            isLoading={isLoadingContent && !currentFolder}
            onFolderClick={handleFolderClick}
            onDeleteClick={openConfirmModal}
            onEditClick={openEditModal}
            user={user}
          />

          {showEmptyFolderMessage && !isLoadingContent && (
            <div className="rounded-[24px] border border-dashed border-[var(--line-soft)] bg-white/55 px-6 py-10 text-center text-[var(--text-muted)]">
              {folderIdFromUrl || currentFolder
                ? "Esta carpeta aún no tiene subcarpetas ni archivos."
                : "Todavía no hay carpetas raíz creadas."}
            </div>
          )}
        </section>

        {shouldShowFilesSection && (
          <section className="soft-panel rounded-[30px] p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-[var(--line-soft)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-main)]">
                  {isGlobalFilesView ? "Resultados en toda la biblioteca" : "Archivos y enlaces"}
                </h3>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text-muted)] shadow-sm">
                Página {pagination.page} de {pagination.totalPages || 1}
              </div>
            </div>

            <LibraryFileGrid
              files={files}
              isLoading={isLoadingContent && !files.length}
              showEmptyMessage={shouldShowFileGridEmptyMessage}
              emptyMessage={
                isGlobalFilesView
                  ? "No hay documentos que coincidan en toda la biblioteca."
                  : "Esta carpeta aún no tiene archivos o enlaces."
              }
              onDeleteClick={openConfirmModal}
              onEditClick={openEditModal}
              user={user}
            />

            {showPagination && (
              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--text-muted)]">
                  {pagination.totalItems} elementos totales en esta vista.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrevPage || isLoadingContent}
                    className={`app-button-ghost ${!pagination.hasPrevPage || isLoadingContent ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        pagination.hasNextPage ? prev + 1 : prev
                      )
                    }
                    disabled={!pagination.hasNextPage || isLoadingContent}
                    className={`app-button-secondary ${!pagination.hasNextPage || isLoadingContent ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {isCreateFolderModalOpen && (
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          parentFolderId={folderIdFromUrl || null}
          groupsToShow={groupsForForms}
          onFolderCreated={refreshData}
        />
      )}

      {isUploadModalOpen && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          targetFolderId={folderIdFromUrl || currentFolder?._id}
          groupsToShow={groupsForForms}
          onFileUploaded={refreshData}
        />
      )}

      {isAddLinkModalOpen && (
        <AddLinkModal
          isOpen={isAddLinkModalOpen}
          onClose={() => setIsAddLinkModalOpen(false)}
          targetFolderId={folderIdFromUrl || currentFolder?._id}
          groupsToShow={groupsForForms}
          onLinkAdded={refreshData}
        />
      )}

      {isConfirmModalOpen && itemToDelete && (
        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setTimeout(() => setItemToDelete(null), 250);
          }}
          itemToDelete={itemToDelete}
          onItemDeleted={refreshData}
        />
      )}

      {isEditModalOpen && itemToEdit && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          itemToEdit={itemToEdit}
          groupsToShow={groupsForForms}
          onItemUpdated={refreshData}
        />
      )}
    </div>
  );
}

export default LibraryHomePage;
