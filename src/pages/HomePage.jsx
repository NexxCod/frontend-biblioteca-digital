// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import folderService from "../services/folderService";
import fileService from "../services/fileService";
import groupService from "../services/groupService";
import tagService from "../services/tagService";

// Hooks personalizados
import useFolderData from "../hooks/useFolderData"; // Asegúrate que la ruta sea correcta

// Componentes de UI
import HomeHeader from "../components/HomeHeader";
import Modal from "../components/Modal";
import FolderGrid from "../components/FolderGrid";
import FileGrid from "../components/FileGrid";
import CreateFolderForm from "../components/CreateFolderForm";
import UploadFileForm from "../components/UploadFileForm";
import AddLinkForm from "../components/AddLinkForm";
import EditFileForm from "../components/EditFileForm";

// Icono (puedes moverlo a un archivo de iconos si lo prefieres)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

function HomePage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { folderId: folderIdFromUrl } = useParams();
  const navigate = useNavigate();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [filterTags, setFilterTags] = useState([]); // Array de IDs de tag
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Hook para gestionar datos de carpetas y archivos
  const {
    currentFolder,
    subfolders,
    files,
    isLoading: isLoadingContent,
    error: contentError,
    refreshData,
  } = useFolderData(folderIdFromUrl, { searchTerm, fileType: filterFileType, tags: filterTags, sortBy, sortOrder });

  // Estados para datos globales necesarios en los formularios/modales
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // Para el selector de filtros

  // Estados para Modales y sus Formularios (Estos serán los siguientes en refactorizar)
  // Modal Crear Carpeta
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderGroupId, setCreateFolderGroupId] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [createFolderError, setCreateFolderError] = useState("");

  // Modal Subir Archivo
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState(""); // String separado por comas
  const [uploadGroupId, setUploadGroupId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal Añadir Enlace
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkTags, setLinkTags] = useState(""); // String separado por comas
  const [linkGroupId, setLinkGroupId] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [addLinkError, setAddLinkError] = useState("");

  // Modal Confirmar Eliminación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { ...item, type: 'file' | 'folder' }
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Modal Editar Ítem (Archivo o Carpeta)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // { ...item, type: 'file' | 'folder' }
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Efecto para cargar grupos disponibles (para selectores en formularios)
  useEffect(() => {
    const fetchRelevantGroups = async () => {
      if (user?.role === "admin") {
        try {
          const groupsData = await groupService.listGroups();
          setAvailableGroups(groupsData || []);
        } catch (error) {
          console.error("Admin: Error fetching all groups:", error);
          setAvailableGroups([]);
        }
      } else if (user) { // No admin, pero logueado
        setAvailableGroups(user.groups || []); // Usa los grupos a los que pertenece el usuario
      } else {
        setAvailableGroups([]); // No logueado o sin grupos
      }
    };
    if (!isAuthLoading) { // Solo ejecutar si la autenticación ha terminado
        fetchRelevantGroups();
    }
  }, [user, isAuthLoading]);

  // Efecto para cargar todas las etiquetas (para el selector de filtros)
  useEffect(() => {
    const fetchAllTags = async () => {
      if (!user || isAuthLoading) return;
      try {
        const tagsData = await tagService.listTags();
        setAvailableTags(tagsData || []);
      } catch (error) {
        console.error("Error fetching available tags:", error);
        setAvailableTags([]);
      }
    };
    if (!isAuthLoading && user) { // Solo si el usuario está cargado
        fetchAllTags();
    }
  }, [user, isAuthLoading]);


  // --- Manejadores de Navegación ---
  const handleFolderClick = useCallback((folder) => {
    setSearchTerm(""); // Resetear filtros al navegar
    setFilterFileType("");
    setFilterTags([]);
    navigate(`/folder/${folder._id}`);
  }, [navigate]);

  const handleBackClick = useCallback(() => {
    const parentId = currentFolder?.parentFolder || null;
    setSearchTerm(""); // Resetear filtros al navegar
    setFilterFileType("");
    setFilterTags([]);
    if (parentId) {
      navigate(`/folder/${parentId}`);
    } else {
      navigate("/");
    }
  }, [currentFolder, navigate]);

  // --- Manejadores para Abrir Modales ---
  const openCreateFolderModal = () => {
    setNewFolderName("");
    setCreateFolderGroupId("");
    setCreateFolderError("");
    setIsCreateFolderModalOpen(true);
  };
  const closeCreateFolderModal = () => setIsCreateFolderModalOpen(false);

  const openUploadModal = () => {
    setUploadFile(null);
    setHasFileSelected(false);
    setUploadDescription("");
    setUploadTags("");
    setUploadGroupId("");
    setUploadError("");
    setUploadProgress(0);
    setIsUploadModalOpen(true);
  };
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const openAddLinkModal = () => {
    setLinkUrl("");
    setLinkTitle("");
    setLinkDescription("");
    setLinkTags("");
    setLinkGroupId("");
    setAddLinkError("");
    setIsAddLinkModalOpen(true);
  };
  const closeAddLinkModal = () => setIsAddLinkModalOpen(false);

  const openConfirmModal = useCallback((item, type) => {
    setItemToDelete({ ...item, type });
    setDeleteError("");
    setIsConfirmModalOpen(true);
  }, []);
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setTimeout(() => { // Delay para animación del modal
      setItemToDelete(null);
      setIsDeleting(false);
      setDeleteError("");
    }, 300);
  };

  const openEditModal = useCallback((item, type) => {
    setItemToEdit({ ...item, type });
    if (type === "folder") {
      setEditFormData({
        name: item.name || "",
        assignedGroupId: item.assignedGroup?._id || "",
      });
    } else { // file or link
      setEditFormData({
        filename: item.filename || "",
        description: item.description || "",
        tags: item.tags?.map((tag) => tag.name).join(", ") || "",
        assignedGroupId: item.assignedGroup?._id || "",
      });
    }
    setEditError("");
    setIsEditModalOpen(true);
  }, []);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => { // Delay para animación
      setItemToEdit(null);
      setEditFormData({});
      setIsUpdating(false);
      setEditError("");
    }, 300);
  };

  // --- Manejadores de Submit de Formularios ---
  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setCreateFolderError("El nombre no puede estar vacío.");
      return;
    }
    setIsCreatingFolder(true);
    setCreateFolderError("");
    try {
      await folderService.createFolder(newFolderName, folderIdFromUrl || null, createFolderGroupId || null);
      closeCreateFolderModal();
      refreshData();
    } catch (error) {
      setCreateFolderError(error?.response?.data?.message || error?.message || "No se pudo crear la carpeta.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setHasFileSelected(true);
      setUploadError("");
    } else {
      setUploadFile(null);
      setHasFileSelected(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const targetFolderIdForUpload = folderIdFromUrl || currentFolder?._id;
    if (!uploadFile || !targetFolderIdForUpload) {
      setUploadError("Selecciona un archivo y asegúrate de estar dentro de una carpeta.");
      return;
    }
    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("folderId", targetFolderIdForUpload);
    if (uploadDescription) formData.append("description", uploadDescription);
    if (uploadTags) formData.append("tags", uploadTags);
    if (uploadGroupId) formData.append("assignedGroupId", uploadGroupId);

    try {
      await fileService.uploadFile(formData, (progress) => setUploadProgress(progress));
      closeUploadModal();
      refreshData();
    } catch (error) {
      setUploadError(error?.response?.data?.message || error?.message || "Error al subir el archivo.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLinkSubmit = async (e) => {
    e.preventDefault();
    const targetFolderIdForLink = folderIdFromUrl || currentFolder?._id;
    if (!linkUrl.trim() || !linkTitle.trim() || !targetFolderIdForLink) {
      setAddLinkError("La URL y el título son obligatorios. Asegúrate de estar en una carpeta.");
      return;
    }
    setIsAddingLink(true);
    setAddLinkError("");
    const payload = {
      url: linkUrl.trim(),
      title: linkTitle.trim(),
      description: linkDescription.trim(),
      tags: linkTags.trim(),
      folderId: targetFolderIdForLink,
      assignedGroupId: linkGroupId || null,
    };
    try {
      await fileService.addLink(payload);
      closeAddLinkModal();
      refreshData();
    } catch (error) {
      setAddLinkError(error?.response?.data?.message || error?.message || "Error al añadir el enlace.");
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      if (itemToDelete.type === "file") {
        await fileService.deleteFile(itemToDelete._id);
      } else if (itemToDelete.type === "folder") {
        await folderService.deleteFolder(itemToDelete._id);
      }
      closeConfirmModal();
      refreshData();
    } catch (error) {
      setDeleteError(error?.response?.data?.message || error?.message || "Error al eliminar el elemento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!itemToEdit) return;
    setIsUpdating(true);
    setEditError("");
    try {
      let updatedItem;
      if (itemToEdit.type === "folder") {
        const folderUpdateData = {
          name: editFormData.name.trim(),
          assignedGroupId: editFormData.assignedGroupId || null,
        };
        updatedItem = await folderService.updateFolder(itemToEdit._id, folderUpdateData);
      } else { // file or link
        const fileUpdateData = {
          filename: editFormData.filename.trim(),
          description: editFormData.description.trim(),
          tags: editFormData.tags.trim(),
          assignedGroupId: editFormData.assignedGroupId || null,
        };
        updatedItem = await fileService.updateFile(itemToEdit._id, fileUpdateData);
      }
      closeEditModal();
      refreshData();
    } catch (error) {
      setEditError(error?.response?.data?.message || error?.message || "Error al guardar los cambios.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Manejadores para Filtros ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFileTypeFilterChange = (e) => setFilterFileType(e.target.value);
  const handleTagFilterChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFilterTags(selectedOptions);
  };
  const handleSortByChange = (e) => setSortBy(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);
  const handleToggleFilterPanel = () => setIsFilterPanelOpen((prev) => !prev);


  // --- Variables Derivadas para Renderizado ---
  const mainTitle = currentFolder ? currentFolder.name : "Inicio";
  const canGoBack = !!folderIdFromUrl; // Podemos volver si estamos en una subcarpeta

  // Determina qué grupos mostrar en los formularios
  const groupsForForms = user?.role === "admin" ? availableGroups : user?.groups || [];

  const showEmptyFolderMessage =
    !isLoadingContent &&
    !contentError &&
    subfolders.length === 0 &&
    files.length === 0;

  const shouldShowFileGridEmptyMessage =
    !isLoadingContent &&
    !contentError &&
    (!files || files.length === 0) &&
    (folderIdFromUrl || currentFolder); // Estamos dentro de una carpeta

  if (isAuthLoading && !user) { // Muestra carga solo si aún no hay usuario
    return (
      <div className="flex justify-center items-center h-screen">
        Verificando sesión...
      </div>
    );
  }

  const displayLoading = isLoadingContent && (!subfolders.length && !files.length && !currentFolder); // Muestra carga general si está cargando Y no hay nada previo que mostrar
  const displayFolderGrid = subfolders.length > 0 || (isLoadingContent && currentFolder); // Muestra la sección de carpetas si hay carpetas o si está cargando y ya tenemos un currentFolder
  const displayFileGrid = files.length > 0 || (isLoadingContent && currentFolder); // Muestra la sección de archivos si hay archivos o si está cargando y ya tenemos un currentFolder


  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <HomeHeader
        canGoBack={canGoBack}
        handleBackClick={handleBackClick}
        currentFolderName={mainTitle}
        user={user}
        currentFolder={currentFolder} // Para habilitar/deshabilitar botones de acción
        openCreateFolderModal={openCreateFolderModal}
        openUploadModal={openUploadModal}
        openAddLinkModal={openAddLinkModal}
        logout={logout}
      />

      {contentError && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{contentError}</p>
      )}
      {displayLoading && ( // Spinner general si está cargando y no hay nada que mostrar
        <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center z-20">
          <p>Cargando contenido...</p>
        </div>
      )}

       {/* Sección de Carpetas */}
  {(!contentError && (subfolders.length > 0 || (isLoadingContent && !currentFolder))) && ( // Mostrar título si hay subcarpetas o si estamos cargando la raíz
      <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
          {currentFolder ? "Subcarpetas" : "Carpetas"}
      </h2>
  )}
  {(!contentError || subfolders.length > 0 ) &&
        <FolderGrid
          folders={subfolders}
          isLoading={isLoadingContent && !subfolders.length} // Para que FolderGrid sepa si mostrar su propio "cargando" si está vacío
          onFolderClick={handleFolderClick}
          onDeleteClick={openConfirmModal}
          onEditClick={openEditModal}
          user={user}
        />
        }
        {showEmptyFolderMessage && !isLoadingContent &&(
          <p className="text-gray-500 text-sm italic pt-2 pl-2">
            {folderIdFromUrl || currentFolder
              ? "(Esta carpeta está vacía)"
              : "(No hay carpetas raíz creadas)"}
          </p>
        )}
   
      {/* Sección de Archivos (solo si estamos en una carpeta) */}
       {(folderIdFromUrl || currentFolder) && !contentError && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 border-b pb-1">
            {(!isLoadingContent || files.length > 0 || isFilterPanelOpen) && !contentError && (
                <h2 className="text-lg font-semibold text-gray-700">
                  Archivos y Enlaces
                </h2>
              )}
            {(folderIdFromUrl || currentFolder) && ( // Mostrar botón de filtro solo si hay una carpeta seleccionada
                 <button
                    onClick={handleToggleFilterPanel}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-expanded={isFilterPanelOpen}
                    aria-controls="filter-panel"
                    title={isFilterPanelOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
                  >
                    <SearchIcon />
                  </button>
            )}
          </div>

          {isFilterPanelOpen && (
            <div
              id="filter-panel"
              className="mb-6 p-3 bg-gray-100 rounded-lg shadow-sm flex flex-wrap gap-3 items-center transition-all duration-300 ease-in-out"
            >
              <div className="flex-1 min-w-[150px] max-w-[250px]">
                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">Buscar:</label>
                <input
                  type="text" id="search" value={searchTerm} onChange={handleSearchChange}
                  placeholder="Nombre, descripción..."
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label htmlFor="filterFileType" className="block text-xs font-medium text-gray-700 mb-1">Tipo:</label>
                <select
                  id="filterFileType" value={filterFileType} onChange={handleFileTypeFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
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
              <div>
                <label htmlFor="filterTags" className="block text-xs font-medium text-gray-700 mb-1">Etiquetas:</label>
                <select
                  id="filterTags" multiple value={filterTags} onChange={handleTagFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs h-auto min-h-[28px]"
                  size={availableTags.length > 3 ? 4 : availableTags.length +1} // Para mejor UI con pocas tags
                >
                  {availableTags.map((tag) => ( <option key={tag._id} value={tag._id}>{tag.name}</option> ))}
                </select>
              </div>
              <div>
                <label htmlFor="sortBy" className="block text-xs font-medium text-gray-700 mb-1">Ordenar por:</label>
                <select
                  id="sortBy" value={sortBy} onChange={handleSortByChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                >
                  <option value="createdAt">Fecha Creación</option>
                  <option value="filename">Nombre</option>
                </select>
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-xs font-medium text-gray-700 mb-1">Dir:</label>
                <select
                  id="sortOrder" value={sortOrder} onChange={handleSortOrderChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          )}
          {(!contentError || files.length > 0) &&
          <FileGrid
            files={files}
            isLoading={isLoadingContent && !files.length}
            showEmptyMessage={shouldShowFileGridEmptyMessage}
            onDeleteClick={openConfirmModal}
            onEditClick={openEditModal}
            user={user}
          />
          }
        </div>
      )}

      {/* Modales */}
      <Modal isOpen={isCreateFolderModalOpen} onClose={closeCreateFolderModal} title="Crear Nueva Carpeta">
        <CreateFolderForm
          groupsToShow={groupsForForms}
          folderName={newFolderName}
          setFolderName={setNewFolderName}
          groupId={createFolderGroupId}
          setGroupId={setCreateFolderGroupId}
          onSubmit={handleCreateFolderSubmit}
          onCancel={closeCreateFolderModal}
          isLoading={isCreatingFolder}
          error={createFolderError}
        />
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title="Subir Nuevo Archivo">
        <UploadFileForm
          groupsToShow={groupsForForms}
          description={uploadDescription}
          setDescription={setUploadDescription}
          tags={uploadTags}
          setTags={setUploadTags}
          groupId={uploadGroupId}
          setGroupId={setUploadGroupId}
          onFileChange={handleFileChange}
          onSubmit={handleUploadSubmit}
          onCancel={closeUploadModal}
          isLoading={isUploading}
          error={uploadError}
          hasFileSelected={hasFileSelected}
          uploadProgress={uploadProgress}
        />
      </Modal>

      <Modal isOpen={isAddLinkModalOpen} onClose={closeAddLinkModal} title="Añadir Enlace">
        <AddLinkForm
          groupsToShow={groupsForForms}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          linkTitle={linkTitle}
          setLinkTitle={setLinkTitle}
          linkDescription={linkDescription}
          setLinkDescription={setLinkDescription}
          linkTags={linkTags}
          setLinkTags={setLinkTags}
          linkGroupId={linkGroupId}
          setLinkGroupId={setLinkGroupId}
          onSubmit={handleAddLinkSubmit}
          onCancel={closeAddLinkModal}
          isLoading={isAddingLink}
          error={addLinkError}
        />
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} title="Confirmar Eliminación">
        <div className="text-center">
          <p className="mb-4">
            ¿Estás seguro de que quieres eliminar <strong>"{itemToDelete?.name || itemToDelete?.filename}"</strong>?
          </p>
          {deleteError && ( <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{deleteError}</p> )}
          <div className="flex justify-center gap-4">
            <button
              type="button" onClick={closeConfirmModal} disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
            >Cancelar</button>
            <button
              type="button" onClick={handleDeleteItem} disabled={isDeleting}
              className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800 focus:outline-none ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            >{isDeleting ? "Eliminando..." : "Eliminar"}</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title={`Editar ${itemToEdit?.type === "folder" ? "Carpeta" : "Archivo/Enlace"}`}
      >
        {itemToEdit?.type === "folder" && (
          <CreateFolderForm // Reutilizamos CreateFolderForm para editar carpetas
            folderName={editFormData.name || ''}
            setFolderName={(value) => setEditFormData((prev) => ({ ...prev, name: value }))}
            groupId={editFormData.assignedGroupId || ''}
            setGroupId={(value) => setEditFormData((prev) => ({ ...prev, assignedGroupId: value }))}
            groupsToShow={groupsForForms}
            onSubmit={handleUpdateItem}
            onCancel={closeEditModal}
            isLoading={isUpdating}
            error={editError}
            submitButtonText="Guardar Cambios"
            isEditing={true}
          />
        )}
        {(itemToEdit?.type === "file" || itemToEdit?.type === "video_link" || itemToEdit?.type === "generic_link") && (
          <EditFileForm
            formData={editFormData}
            setFormData={setEditFormData} // Pasamos el setter directamente
            groupsToShow={groupsForForms}
            onSubmit={handleUpdateItem}
            onCancel={closeEditModal}
            isLoading={isUpdating}
            error={editError}
          />
        )}
      </Modal>
    </div>
  );
}

export default HomePage;