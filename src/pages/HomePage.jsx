// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import groupService from "../services/groupService";
import tagService from "../services/tagService";

// Hooks personalizados
import useFolderData from "../hooks/useFolderData"; // Asegúrate que la ruta sea correcta

// Componentes de UI
import HomeHeader from "../components/HomeHeader";
import FolderGrid from "../components/FolderGrid";
import FileGrid from "../components/FileGrid";
import FilterPanel from "../components/Filters/FilterPanel";

// Modales
import CreateFolderModal from "../components/Modals/CreateFolderModal";
import UploadFileModal from "../components/Modals/UploadFileModal";
import AddLinkModal from "../components/Modals/AddLinkModal";
import ConfirmDeleteModal from "../components/Modals/ConfirmDeleteModal";
import EditItemModal from "../components/Modals/EditItemModal";

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
  } = useFolderData(folderIdFromUrl, {
    searchTerm,
    fileType: filterFileType,
    tags: filterTags,
    sortBy,
    sortOrder,
  });

  // Estados para datos globales necesarios en los formularios/modales
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // Para el selector de filtros

  // Estados para Modales y sus Formularios (Estos serán los siguientes en refactorizar)
  // Modal Crear Carpeta
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // Modal Subir Archivo
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Modal Añadir Enlace
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  // Modal Confirmar Eliminación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { ...item, type: 'file' | 'folder' }

  // Modal Editar Ítem (Archivo o Carpeta)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // { ...item, type: 'file' | 'folder' }

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
      } else if (user) {
        // No admin, pero logueado
        setAvailableGroups(user.groups || []); // Usa los grupos a los que pertenece el usuario
      } else {
        setAvailableGroups([]); // No logueado o sin grupos
      }
    };
    if (!isAuthLoading) {
      // Solo ejecutar si la autenticación ha terminado
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
    if (!isAuthLoading && user) {
      // Solo si el usuario está cargado
      fetchAllTags();
    }
  }, [user, isAuthLoading]);

  // --- Manejadores de Navegación ---
  const handleFolderClick = useCallback(
    (folder) => {
      setSearchTerm(""); // Resetear filtros al navegar
      setFilterFileType("");
      setFilterTags([]);
      navigate(`/folder/${folder._id}`);
    },
    [navigate]
  );

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
    setIsCreateFolderModalOpen(true);
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const openAddLinkModal = () => {
    setIsAddLinkModalOpen(true);
  };

  const openConfirmModal = useCallback((item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmModalOpen(true);
  }, []);

  const closeConfirmAndDeleteItemState = () => {
    setIsConfirmModalOpen(false);
    setTimeout(() => {
      setItemToDelete(null);
      // No necesitas limpiar isDeleting o deleteError aquí ya que no están en HomePage
    }, 300); // Coincide con la duración de la animación del modal si la hay
  };

  const openEditModal = useCallback((item, type) => {
    setItemToEdit({ ...item, type });

    setIsEditModalOpen(true);
  }, []);

  const handleItemSuccessfullyUpdated = () => {
    refreshData();
  };

  const handleFilterChange = useCallback((filterName, value) => {
    switch (filterName) {
      case "searchTerm":
        setSearchTerm(value);
        break;
      case "fileType":
        setFilterFileType(value);
        break;
      case "tags":
        setFilterTags(value); // value ya es un array de IDs desde FilterPanel
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
  }, []); // Dependencias vacías ya que los setters de useState son estables

  const handleToggleFilterPanel = () => setIsFilterPanelOpen((prev) => !prev);
  // --- Variables Derivadas para Renderizado ---
  const mainTitle = currentFolder ? currentFolder.name : "Inicio";
  const canGoBack = !!folderIdFromUrl; // Podemos volver si estamos en una subcarpeta

  // Determina qué grupos mostrar en los formularios
  const groupsForForms =
    user?.role === "admin" ? availableGroups : user?.groups || [];

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

  if (isAuthLoading && !user) {
    // Muestra carga solo si aún no hay usuario
    return (
      <div className="flex justify-center items-center h-screen">
        Verificando sesión...
      </div>
    );
  }

  const displayLoading =
    isLoadingContent && !subfolders.length && !files.length && !currentFolder; // Muestra carga general si está cargando Y no hay nada previo que mostrar

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
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">
          {contentError}
        </p>
      )}
      {displayLoading && ( // Spinner general si está cargando y no hay nada que mostrar
        <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center z-20">
          <p>Cargando contenido...</p>
        </div>
      )}

      {/* Sección de Carpetas */}
      {!contentError &&
        (subfolders.length > 0 || (isLoadingContent && !currentFolder)) && ( // Mostrar título si hay subcarpetas o si estamos cargando la raíz
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
            {currentFolder ? "Subcarpetas" : "Carpetas"}
          </h2>
        )}
      {(!contentError || subfolders.length > 0) && (
        <FolderGrid
          folders={subfolders}
          isLoading={isLoadingContent && !subfolders.length} // Para que FolderGrid sepa si mostrar su propio "cargando" si está vacío
          onFolderClick={handleFolderClick}
          onDeleteClick={openConfirmModal}
          onEditClick={openEditModal}
          user={user}
        />
      )}
      {showEmptyFolderMessage && !isLoadingContent && (
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
            {(!isLoadingContent || files.length > 0 || isFilterPanelOpen) &&
              !contentError && (
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
                title={
                  isFilterPanelOpen ? "Ocultar Filtros" : "Mostrar Filtros"
                }
              >
                <SearchIcon />
              </button>
            )}
          </div>

          {/* RENDERIZAR EL NUEVO FilterPanel */}
          {isFilterPanelOpen && (
            <FilterPanel
              filters={{
                searchTerm,
                fileType: filterFileType,
                tags: filterTags,
                sortBy,
                sortOrder,
              }}
              onFilterChange={handleFilterChange}
              availableTags={availableTags}
            />
          )}
          {(!contentError || files.length > 0) && (
            <FileGrid
              files={files}
              isLoading={isLoadingContent && !files.length}
              showEmptyMessage={shouldShowFileGridEmptyMessage}
              onDeleteClick={openConfirmModal}
              onEditClick={openEditModal}
              user={user}
            />
          )}
        </div>
      )}

      {/* Modales */}
      {isCreateFolderModalOpen && ( // Controla la renderización del modal
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen} // isOpen sigue siendo necesario para el componente Modal interno
          onClose={() => setIsCreateFolderModalOpen(false)}
          parentFolderId={folderIdFromUrl || null} // Pasa el ID de la carpeta padre actual
          groupsToShow={groupsForForms} // Pasa los grupos disponibles
          onFolderCreated={refreshData} // Pasa la función para recargar datos
        />
      )}

      {isUploadModalOpen && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          targetFolderId={folderIdFromUrl || currentFolder?._id} // Asegúrate de tener una carpeta destino
          groupsToShow={groupsForForms}
          onFileUploaded={refreshData}
        />
      )}

      {isAddLinkModalOpen && (
        <AddLinkModal
          isOpen={isAddLinkModalOpen}
          onClose={() => setIsAddLinkModalOpen(false)}
          targetFolderId={folderIdFromUrl || currentFolder?._id} // Asegúrate de tener una carpeta destino
          groupsToShow={groupsForForms}
          onLinkAdded={refreshData} // Callback para refrescar
        />
      )}

      {isConfirmModalOpen &&
        itemToDelete && ( // Asegúrate que itemToDelete exista
          <ConfirmDeleteModal
            isOpen={isConfirmModalOpen}
            onClose={closeConfirmAndDeleteItemState} // Actualiza para usar el setter
            itemToDelete={itemToDelete}
            onItemDeleted={refreshData} // Callback para refrescar
          // onDeletionError={(errorMessage) => setContentError(errorMessage)} // Opcional: si quieres manejar el error en HomePage
          />
        )}

      {isEditModalOpen &&
        itemToEdit && ( // Asegúrate que itemToEdit exista
          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)} // Actualiza para usar el setter
            itemToEdit={itemToEdit}
            groupsToShow={groupsForForms}
            onItemUpdated={handleItemSuccessfullyUpdated} // Callback para refrescar
          />
        )}
    </div>
  );
}

export default HomePage;
