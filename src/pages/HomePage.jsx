import React, { useState, useEffect, useCallback } from "react";
// Quitamos useRef si no lo usamos para debounce de filtros aún
import HomeHeader from "../components/HomeHeader";
import { useAuth } from "../contexts/AuthContext";
import folderService from "../services/folderService";
import fileService from "../services/fileService";
import groupService from "../services/groupService";
import tagService from "../services/tagService";
import Modal from "../components/Modal";
import FolderGrid from "../components/FolderGrid";
import FileGrid from "../components/FileGrid";
import CreateFolderForm from "../components/CreateFolderForm";
import UploadFileForm from "../components/UploadFileForm";
import AddLinkForm from "../components/AddLinkForm";
import EditFileForm from "../components/EditFileForm";

// --- Icono de Lupa (SearchIcon) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
// ------------------------------------

function HomePage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  // --- Estados ---
  const [currentFolder, setCurrentFolder] = useState(null);
  const [subfolders, setSubfolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFileType, setFilterFileType] = useState(""); // Para el filtro por tipo
  const [filterTags, setFilterTags] = useState([]); // Para el filtro por tags (guardaremos los IDs)
  const [availableTags, setAvailableTags] = useState([]); // Para cargar las tags disponibles para filtrar
  const [sortBy, setSortBy] = useState("createdAt"); // Criterio de ordenación por defecto
  const [sortOrder, setSortOrder] = useState("desc"); // Dirección de ordenación por defecto

  const [folderIdToLoad, setFolderIdToLoad] = useState(null);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Estados Modales
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderGroupId, setCreateFolderGroupId] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [createFolderError, setCreateFolderError] = useState("");
  // Estados Modales UploadFile
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadGroupId, setUploadGroupId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados Modales AddLink
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkTags, setLinkTags] = useState("");
  const [linkGroupId, setLinkGroupId] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [addLinkError, setAddLinkError] = useState("");

  // --- NUEVOS ESTADOS para Modal de Confirmación de Eliminación ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { _id: ..., name: ..., type: 'file' | 'folder' }
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // --- ESTADOS para Modal de Edición ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // { _id: ..., name: ..., type: 'file' | 'folder', ...otros datos }
  // Estado para manejar los datos del formulario de edición
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  // ----------------------------------------

  // --- Función para Cargar Contenido (useCallback) ---
  const loadFolderContent = useCallback(
    async (
      folderId,
      {
        searchTerm = "",
        fileType = "",
        tags = [], // Espera un array de IDs de tags
        sortBy = "createdAt",
        sortOrder = "desc",
      } = {}
    ) => {
      console.log(
        "loadFolderContent llamado para folderId:",
        folderId,
        "con params:",
        { searchTerm, fileType, tags, sortBy, sortOrder }
      );

      setIsLoadingFolders(true);
      setIsLoadingFiles(true); // Considerar mostrar un solo estado de carga principal si prefieres
      setError("");
      setSubfolders([]); // Limpiar datos viejos inmediatamente
      setFiles([]); // Limpiar datos viejos inmediatamente

      let targetFolderObject = null;


      try {
        // Paso 1: Obtener el objeto de la carpeta actual (o null si es la raíz)
        if (folderId) {
          targetFolderObject = await folderService.getFolderDetails(folderId);
          console.log('Detalles de carpeta obtenidos:', targetFolderObject);
        } else {
           // Si es la raíz, no hay objeto de carpeta, simulamos uno básico o manejamos null
           targetFolderObject = null; // La raíz no tiene objeto de carpeta en este modelo
           console.log('Cargando carpeta raíz. No hay detalles de carpeta.');
        }

        // Paso 2: Cargar subcarpetas y archivos para este folderId EN PARALELO
        const [subfolderResults, fileResults] = await Promise.all([
          folderService.listFolders(folderId),
          fileService.listFiles(folderId, { // listFiles ya maneja folderId null si tu backend lo permite para archivos raíz
            search: searchTerm,
            fileType: fileType,
            tags: tags.join(","),
            sortBy: sortBy,
            sortOrder: sortOrder,
          }).catch(err => { // Manejar errores específicos de listFiles si es necesario
               console.error('Error listando archivos en loadFolderContent:', err);
               // Puedes decidir propagar el error principal o manejarlo aquí
               return []; // Devolver array vacío si falla solo listFiles
          })
        ]);

        console.log("Resultados listFolders:", subfolderResults);
        console.log("Resultados listFiles:", fileResults);


        // Paso 3: Actualizar TODOS los estados relevantes SOLO después de que ambas peticiones terminen
        setCurrentFolder(targetFolderObject); // Ahora actualizamos el objeto completo aquí
        setSubfolders(subfolderResults || []);
        setFiles(fileResults || []);


      } catch (err) {
        console.error(`Error cargando contenido para folderId ${folderId}:`, err);
        // Limpiar estados y mostrar error general
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Error al cargar contenido."
        );
        setCurrentFolder(folderId ? { _id: folderId, name: 'Error al cargar', parentFolder: null } : null); // Intenta mantener algo de contexto si es un error
        setSubfolders([]);
        setFiles([]);
      } finally {
        // Desactivar estados de carga al finalizar (éxito o error)
        setIsLoadingFolders(false);
        setIsLoadingFiles(false);
        console.log('loadFolderContent finalizado para folderId:', folderId);
      }
    },
    [
      searchTerm,
      filterFileType,
      filterTags,
      sortBy,
      sortOrder,
      // Dependencias externas que afectan la carga con los parámetros actuales
       folderService, // Asegúrate de que estas dependencias de servicio sean estables o no cambien
       fileService
    ] // El useCallback depende de los parámetros de búsqueda/filtro y servicios
  );

  // --- Efecto para Cargar Grupos Disponibles (SI es Admin) ---
  useEffect(() => {
    const fetchAllGroupsForAdmin = async () => {
      if (user?.role === "admin") {
        try {
          const groupsData = await groupService.listGroups();
          setAvailableGroups(groupsData || []);
        } catch (error) {
          console.error("Admin: Error fetching all groups:", error);
        }
      } else {
        setAvailableGroups([]);
      }
    };
    if (user && !isAuthLoading) {
      fetchAllGroupsForAdmin();
    }
  }, [user, isAuthLoading]);

  // --- Efecto Inicial: Cargar Carpetas Raíz ---
  // --- Efecto Inicial: Cargar Carpetas Raíz ---
  useEffect(() => {
    console.log("Effect principal disparado. Estado de folderIdToLoad:", folderIdToLoad, "user:", !!user, "isAuthLoading:", isAuthLoading);

    // Solo cargar si la autenticación terminó y hay un usuario
    // Y si folderIdToLoad ha cambiado (incluyendo el inicio con null)
    // La condición `folderIdToLoad === null` cubre la carga inicial de la raíz.
    if (!isAuthLoading && user) {
       console.log('Condición de Effect cumplida. Llamando loadFolderContent...');
       // Llamar a loadFolderContent con el folderId que el efecto indica que debe cargar
       loadFolderContent(folderIdToLoad, {
          searchTerm,
          fileType: filterFileType,
          tags: filterTags,
          sortBy,
          sortOrder,
       });
    } else if (!isAuthLoading && !user) {
        // Si la autenticación terminó pero no hay usuario, puede que estés en login/register
        // Asegurarse de que la UI refleje un estado vacío o de no autenticado
        console.log('Usuario no autenticado después de cargar. Limpiando estados de contenido.');
        setSubfolders([]);
        setFiles([]);
        setCurrentFolder(null); // Asegurarse de que la carpeta actual es null si no logueado
        setFolderIdToLoad(null); // Resetear también el ID a cargar
        setError(""); // Limpiar errores de carga si los había
    }

}, [
    folderIdToLoad, // <-- Esta es la dependencia clave para disparar al navegar
    searchTerm,
    filterFileType,
    filterTags,
    sortBy,
    sortOrder,
    isAuthLoading, // Necesario para cargar inicialmente después de la auth
    user,          // Necesario para cargar inicialmente después de la auth
    loadFolderContent // useCallback asegura que esta dependencia sea estable
]);

  // --- Efecto para Cargar Tags Disponibles ---
  useEffect(() => {
    const fetchTags = async () => {
      if (!user || isAuthLoading) return; // No cargar si no hay usuario o auth está cargando
      try {
        const tagsData = await tagService.listTags(); // Asumiendo que tienes un tagService.js con listTags
        setAvailableTags(tagsData || []);
      } catch (error) {
        console.error("Error fetching available tags:", error);
        // Decide cómo manejar el error (mostrar mensaje, etc.)
      }
    };

    fetchTags();
    // Dependencias: Vuelve a cargar tags si el usuario o el estado de carga de autenticación cambian
  }, [user, isAuthLoading]); // Depende de user y isAuthLoading del contexto de auth

  // --- NUEVAS FUNCIONES para el flujo de eliminación ---
  const openConfirmModal = (item, type) => {
    console.log("Abriendo confirmación para eliminar:", type, item);
    setItemToDelete({ ...item, type }); // Guardamos el item y su tipo ('file' o 'folder')
    setDeleteError(""); // Limpiar error previo
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    // Es buena idea resetearlos al cerrar por si acaso
    setTimeout(() => {
      // Pequeño delay para que no se vea el cambio antes de cerrar
      setItemToDelete(null);
      setIsDeleting(false);
      setDeleteError("");
    }, 300); // Ajusta el tiempo si es necesario
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (itemToDelete.type === "file") {
        console.log("Intentando eliminar archivo:", itemToDelete._id);
        await fileService.deleteFile(itemToDelete._id);
      } else if (itemToDelete.type === "folder") {
        console.log("Intentando eliminar carpeta:", itemToDelete._id);
        await folderService.deleteFolder(itemToDelete._id);
      }
      console.log("Eliminación exitosa");
      closeConfirmModal();
      // Refrescar la vista actual después de eliminar
      loadFolderContent(currentFolder?._id, {
        searchTerm,
        fileType: filterFileType,
        tags: filterTags,
        sortBy,
        sortOrder,
      }); // Llama con el ID actual
    } catch (error) {
      console.error("Error al eliminar:", error);
      // Mostrar el mensaje específico del backend si existe (ej: carpeta no vacía)
      setDeleteError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al eliminar el elemento."
      );
      // No cerramos el modal en caso de error para que el usuario vea el mensaje
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------
  // --- NUEVAS FUNCIONES para el flujo de edición ---
  const openEditModal = (item, type) => {
    console.log("Abriendo modal para editar:", type, item);
    setItemToEdit({ ...item, type }); // Guardar item y tipo
    // Inicializar los datos del formulario con los valores actuales del item
    if (type === "folder") {
      setEditFormData({
        name: item.name || "",
        // Asegúrate que item.assignedGroup es el ID o null/undefined
        assignedGroupId: item.assignedGroup?._id || "",
      });
    } else {
      // 'file'
      setEditFormData({
        filename: item.filename || "",
        description: item.description || "",
        // Tags: necesita conversión de array de objetos a string separado por comas
        tags: item.tags?.map((tag) => tag.name).join(", ") || "",
        assignedGroupId: item.assignedGroup?._id || "",
      });
    }
    setEditError(""); // Limpiar error previo
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setItemToEdit(null);
      setEditFormData({});
      setIsUpdating(false);
      setEditError("");
    }, 300);
  };

  // Handler genérico para cambios en el formulario de edición
  // (Usado por EditFileForm, y podrías adaptarlo para EditFolderForm si no usas setters directos)
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault(); // Prevenir submit por defecto del form
    if (!itemToEdit) return;

    setIsUpdating(true);
    setEditError("");

    try {
      let updatedItem;
      if (itemToEdit.type === "folder") {
        // Datos a enviar para actualizar carpeta
        const folderUpdateData = {
          name: editFormData.name.trim(),
          // Envía null si el valor es vacío '', de lo contrario envía el ID
          assignedGroupId: editFormData.assignedGroupId || null,
        };
        console.log("Actualizando carpeta:", itemToEdit._id, folderUpdateData);
        updatedItem = await folderService.updateFolder(
          itemToEdit._id,
          folderUpdateData
        );
      } else {
        // 'file'
        // Datos a enviar para actualizar archivo/enlace
        const fileUpdateData = {
          filename: editFormData.filename.trim(),
          description: editFormData.description.trim(),
          tags: editFormData.tags.trim(), // El backend espera un string de tags
          assignedGroupId: editFormData.assignedGroupId || null,
        };
        console.log("Actualizando archivo:", itemToEdit._id, fileUpdateData);
        updatedItem = await fileService.updateFile(
          itemToEdit._id,
          fileUpdateData
        );
      }
      console.log("Actualización exitosa:", updatedItem);
      closeEditModal();
      // Refrescar la vista actual después de actualizar
      loadFolderContent(currentFolder?._id, {
        searchTerm,
        fileType: filterFileType,
        tags: filterTags,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
      setEditError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al guardar los cambios."
      );
    } finally {
      setIsUpdating(false);
    }
  };
  // ----------------------------------------------------
  // --- Handlers Navegación ---
  const handleFolderClick = (folder) => {
    // Al navegar a una subcarpeta, podrías querer resetear los filtros/búsqueda
    setSearchTerm(""); // Resetear término de búsqueda
    setFilterFileType(""); // Resetear filtro de tipo
    setFilterTags([]); // Resetear filtro de tags
    // Podrías mantener la ordenación o resetearla también
    // setSortBy('createdAt');
    // setSortOrder('desc');
    setFolderIdToLoad(folder._id); 

    loadFolderContent(folder._id, {
      searchTerm: "", // Usar el estado *después* del reseteo, o pasar valores fijos si reseteas
      fileType: "",
      tags: [],
      sortBy, // Usar el estado actual (si no lo reseteaste)
      sortOrder, // Usar el estado actual (si no lo reseteaste)
    });
  };
  const handleBackClick = () => {
    const parentId = currentFolder?.parentFolder || null;

    // Resetear filtros/búsqueda al volver (opcional)
    setSearchTerm("");
    setFilterFileType("");
    setFilterTags([]);
    // Podrías mantener la ordenación o resetearla también
    // setSortBy('createdAt');
    // setSortOrder('desc');
    setFolderIdToLoad(parentId);

    loadFolderContent(parentId, {
      searchTerm: "", // Usar el estado *después* del reseteo
      fileType: "",
      tags: [],
      sortBy, // Usar el estado actual (si no lo reseteaste)
      sortOrder, // Usar el estado actual (si no lo reseteaste)
    });
  };

  // --- Handlers Modales (sin cambios en su lógica interna) ---
  const openCreateFolderModal = () => {
    setNewFolderName("");
    setCreateFolderGroupId("");
    setCreateFolderError("");
    setIsCreateFolderModalOpen(true);
  };
  const closeCreateFolderModal = () => setIsCreateFolderModalOpen(false);
  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setCreateFolderError("El nombre no puede estar vacío.");
      return;
    }
    setIsCreatingFolder(true);
    setCreateFolderError("");
    try {
      await folderService.createFolder(
        newFolderName,
        currentFolder?._id,
        createFolderGroupId || null
      );
      closeCreateFolderModal();
      loadFolderContent(currentFolder?._id); // Refrescar
    } catch (error) {
      setCreateFolderError(error?.message || "No se pudo crear la carpeta.");
    } finally {
      setIsCreatingFolder(false);
    }
  };
  // ... (resto de handlers open/close/submit para Upload y AddLink sin cambios)...
  const openUploadModal = () => {
    setUploadFile(null);
    setHasFileSelected(false); // Resetear al abrir
    setUploadDescription("");
    setUploadTags("");
    // Heredar grupo de la carpeta actual por defecto? O siempre público?
    // setUploadGroupId(currentFolder?.assignedGroup?._id || ''); // Ejemplo: Heredar grupo
    setUploadGroupId(""); // Empezar con público
    setUploadError("");
    setUploadProgress(0);
    setIsUploadModalOpen(true);
  };
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setHasFileSelected(true); // Archivo seleccionado
      setUploadError(""); // Limpiar error si selecciona un archivo nuevo
    } else {
      setUploadFile(null);
      setHasFileSelected(false); // No hay archivo
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !currentFolder) {
      // Necesitamos archivo y carpeta destino
      setUploadError(
        "Selecciona un archivo y asegúrate de estar dentro de una carpeta."
      );
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    // Crear FormData
    const formData = new FormData();
    formData.append("file", uploadFile); // El archivo en sí [cite: 393]
    formData.append("folderId", currentFolder._id); // ID de la carpeta actual [cite: 10, 37]
    if (uploadDescription) formData.append("description", uploadDescription); // [cite: 10]
    if (uploadTags) formData.append("tags", uploadTags); // [cite: 10]
    if (uploadGroupId) formData.append("assignedGroupId", uploadGroupId); // [cite: 10, 13]

    try {
      // Llamar al servicio
      await fileService.uploadFile(formData, (progress) => {
        setUploadProgress(progress); 
      });
      closeUploadModal();
      loadFolderContent(currentFolder._id, currentFolder); // Refrescar contenido
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al subir el archivo."
      ); 
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handlers Modales Add Link ---
  const openAddLinkModal = () => {
    setLinkUrl("");
    setLinkTitle("");
    setLinkDescription("");
    setLinkTags("");
    // setLinkGroupId(currentFolder?.assignedGroup?._id || ''); // Ejemplo: Heredar grupo
    setLinkGroupId(""); // Empezar con público
    setAddLinkError("");
    setIsAddLinkModalOpen(true);
  };
  const closeAddLinkModal = () => setIsAddLinkModalOpen(false);

  // IMPLEMENTACIÓN: Manejar submit de añadir enlace
  const handleAddLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim() || !currentFolder) {
      setAddLinkError(
        "La URL del video y el título son obligatorios. Asegúrate de estar en una carpeta."
      );
      return;
    }
    // Podrías añadir validación extra de URL aquí si quieres

    setIsAddingLink(true);
    setAddLinkError("");

    // Crear payload JSON
    const payload = {
      url: linkUrl.trim(), // [cite: 77]
      title: linkTitle.trim(), // [cite: 77]
      description: linkDescription.trim(), // [cite: 77]
      tags: linkTags.trim(), // [cite: 77]
      folderId: currentFolder._id, // [cite: 77]
      assignedGroupId: linkGroupId || null, // [cite: 77]
    };

    try {
      // Llamar al servicio
      await fileService.addLink(payload); // [cite: 17]
      closeAddLinkModal();
      loadFolderContent(currentFolder._id, currentFolder); // Refrescar contenido
    } catch (error) {
      console.error("Error añadiendo enlace:", error);
      setAddLinkError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al añadir el enlace."
      ); // [cite: 101]
    } finally {
      setIsAddingLink(false);
    }
  };

  // --- Determinar qué grupos mostrar en los desplegables ---
  const groupsToShow = user?.role === "admin" ? availableGroups : user?.groups;

  // --- Handlers para Búsqueda, Filtrado y Ordenación (NUEVO) ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Podrías añadir un debounce aquí si quieres
    // Pero por ahora, llamaremos a loadFolderContent en el useEffect
  };

  const handleFileTypeFilterChange = (e) => {
    setFilterFileType(e.target.value);
    // La carga de contenido se disparará en el useEffect por el cambio de estado
  };

  const handleTagFilterChange = (e) => {
    // Asumimos un selector múltiple que devuelve un array de IDs
    // O si es un <select multiple>, e.target.value sería un array de strings (IDs)
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFilterTags(selectedOptions);
    // La carga se disparará en el useEffect
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    // La carga se disparará en el useEffect
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    // La carga se disparará en el useEffect
  };
  // -----------------------------------------------------------
  // --- NUEVO Handler para el Toggle del Panel de Filtros ---
  const handleToggleFilterPanel = () => {
    setIsFilterPanelOpen((prev) => !prev);
  };

  // --- Variables para Renderizado (Con ajustes para UI Raíz) ---
  const mainTitle = currentFolder ? `${currentFolder.name}` : "Inicio";
  const canGoBack = currentFolder !== null;
  const folderSectionTitle = currentFolder ? "Subcarpetas" : "Carpetas";
  // Condición para mostrar mensaje de "vacío"
  const showEmptyFolderMessage =
    !isLoadingFolders &&
    !isLoadingFiles &&
    !error &&
    subfolders.length === 0 &&
    files.length === 0; // Mensaje de carpeta totalmente vacía
  const showEmptyFilesMessage =
    currentFolder &&
    !isLoadingFiles &&
    !error &&
    files.length === 0 &&
    subfolders.length > 0; // Mensaje si hay carpetas pero no archivos

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Verificando sesión...
      </div>
    );
  }

  // --- RETURN (con ajustes de UI para Raíz/Home) ---
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* --- Cabecera --- */}
      <HomeHeader
        canGoBack={canGoBack}
        handleBackClick={handleBackClick}
        currentFolderName={mainTitle} // Usa el título dinámico
        user={user}
        currentFolder={currentFolder}
        openCreateFolderModal={openCreateFolderModal}
        openUploadModal={openUploadModal}
        openAddLinkModal={openAddLinkModal}
        logout={logout}
      />

      {/* Mensaje de Error General */}
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>
      )}

      

      {/* --- Sección de Carpetas/Subcarpetas --- */}
      <div className="mb-8">
        {/* 1. Muestra Título SOLO si está cargando o si hay subcarpetas */}
        {(isLoadingFolders || subfolders.length > 0) && !error && (
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
            {folderSectionTitle}
          </h2>
        )}
        <FolderGrid
          folders={subfolders}
          //isLoading={isLoadingFolders}
          onFolderClick={handleFolderClick}
          onDeleteClick={openConfirmModal}
          onEditClick={openEditModal}
          user={user}
        />
        {/* Mensaje específico si solo subcarpetas está vacío pero hay archivos (y no estamos en raíz) */}
        {/* Mensaje si la carpeta está TOTALMENTE vacía */}
        {showEmptyFolderMessage && (
          <p className="text-gray-500 text-sm italic pt-2 pl-2">
            {currentFolder
              ? "(Esta carpeta está vacía)"
              : "(No hay carpetas raíz creadas)"}
          </p>
        )}
      </div>

      {/* --- Sección de Archivos/Enlaces (CONDICIONAL) --- */}
      {currentFolder && ( // Mostrar la sección entera solo si estamos dentro de una carpeta
    <div className="mt-8">
        {/* Contenedor para el Título y el Botón Toggle */}
        <div className="flex items-center justify-between mb-3 border-b pb-1"> {/* Usamos flex para alinear */}
             {/* Título */}
             {(isLoadingFiles || files.length > 0 || isFilterPanelOpen) && !error && ( // Mostrar título si hay archivos, cargando O si el panel está abierto
                <h2 className="text-lg font-semibold text-gray-700"> {/* Eliminamos mb-3, pb-1 de aquí */}
                    Archivos y Enlaces
                </h2>
             )}
             {/* Botón Toggle de Lupa */}
             {/* Mostrar la lupa SI estamos en una carpeta, independientemente de si hay archivos cargados */}
             <button
                onClick={handleToggleFilterPanel}
                className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300" // Estilo de botón de icono
                aria-expanded={isFilterPanelOpen}
                aria-controls="filter-panel"
                title={isFilterPanelOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'} // Tooltip/Título
             >
                <SearchIcon /> {/* Usamos el icono de lupa */}
             </button>
        </div>


         {/* Contenedor del Panel de Filtros (Visible condicionalmente) */}
         {/* Este div se queda en su posición actual, arriba de FileGrid */}
         {isFilterPanelOpen && (
            <div
                id="filter-panel"
                className="mb-6 p-3 bg-gray-100 rounded-lg shadow-sm flex flex-wrap gap-3 items-center transition-all duration-300 ease-in-out"
            >
                {/* ... Controles de Búsqueda, Tipo, Tags, Ordenación ... */}
                {/* Manten todo el contenido del panel que ajustamos antes aquí */}

                   <div className="flex-1 min-w-[150px] max-w-[250px]">
                       <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">Buscar:</label>
                       <input type="text" id="search" value={searchTerm} onChange={handleSearchChange} placeholder="Nombre, descripción..." className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs" />
                   </div>
                   <div>
                       <label htmlFor="filterFileType" className="block text-xs font-medium text-gray-700 mb-1">Tipo:</label>
                       <select id="filterFileType" value={filterFileType} onChange={handleFileTypeFilterChange} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs">
                           <option value="">Todos</option>
                           <option value="pdf">PDF</option><option value="word">Word</option><option value="excel">Excel</option><option value="pptx">PowerPoint</option><option value="image">Imagen</option><option value="video_link">Enlace Video</option><option value="generic_link">Enlace Genérico</option><option value="other">Otro</option>
                       </select>
                   </div>
                    <div>
                       <label htmlFor="filterTags" className="block text-xs font-medium text-gray-700 mb-1">Etiquetas:</label>
                       <select id="filterTags" multiple value={filterTags} onChange={handleTagFilterChange} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs h-auto min-h-[28px]">
                           {availableTags.map(tag => (<option key={tag._id} value={tag._id}>{tag.name}</option>))}
                       </select>
                   </div>
                   <div>
                       <label htmlFor="sortBy" className="block text-xs font-medium text-gray-700 mb-1">Ordenar por:</label>
                       <select id="sortBy" value={sortBy} onChange={handleSortByChange} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs">
                           <option value="createdAt">Fecha Creación</option><option value="filename">Nombre</option>
                       </select>
                   </div>
                   <div>
                        <label htmlFor="sortOrder" className="block text-xs font-medium text-gray-700 mb-1">Dir:</label>
                       <select id="sortOrder" value={sortOrder} onChange={handleSortOrderChange} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs">
                           <option value="desc">Desc</option><option value="asc">Asc</option>
                       </select>
                   </div>


            </div>
        )}
          {/* Grid */}
          <FileGrid
            files={files}
            isLoading={isLoadingFiles}
            onDeleteClick={openConfirmModal}
            onEditClick={openEditModal}
            user={user}
          />
          {/* Mensaje si SOLO archivos está vacío pero hay carpetas */}
          {showEmptyFilesMessage && (
            <p className="text-gray-500 text-sm italic pt-2 pl-2">
              (No hay archivos o enlaces)
            </p>
          )}
        </div>
      )}
      {/* Fin de la sección condicional */}

      {/* --- Modales --- */}
      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        title="Crear Nueva Carpeta"
      >
        <CreateFolderForm
          groupsToShow={groupsToShow}
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
      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Subir Nuevo Archivo"
      >
        <UploadFileForm
          groupsToShow={groupsToShow}
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
      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={closeAddLinkModal}
        title="Añadir Enlace de Video (YouTube)"
      >
        <AddLinkForm
          groupsToShow={groupsToShow}
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
      {/* --- NUEVO Modal de Confirmación de Eliminación --- */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        title="Confirmar Eliminación"
      >
        <div className="text-center">
          <p className="mb-4">
            ¿Estás seguro de que quieres eliminar{" "}
            <strong>"{itemToDelete?.name || itemToDelete?.filename}"</strong>?
          </p>
          {/* Mostrar error si existe */}
          {deleteError && (
            <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
              {deleteError}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={closeConfirmModal}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800 focus:outline-none ${
                isDeleting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title={`Editar ${
          itemToEdit?.type === "folder" ? "Carpeta" : "Archivo/Enlace"
        }`}
      >
        {/* Renderizar formulario condicionalmente */}
        {itemToEdit?.type === "folder" && (
          <CreateFolderForm // Reutilizamos CreateFolderForm
            // Pasamos props para que funcione como edición
            folderName={editFormData.name}
            setFolderName={(value) =>
              setEditFormData((prev) => ({ ...prev, name: value }))
            }
            groupId={editFormData.assignedGroupId}
            setGroupId={(value) =>
              setEditFormData((prev) => ({ ...prev, assignedGroupId: value }))
            }
            groupsToShow={groupsToShow}
            onSubmit={handleUpdateItem} // Usar el handler de update
            onCancel={closeEditModal}
            isLoading={isUpdating}
            error={editError}
            // Cambiar texto del botón y autofocus
            submitButtonText="Guardar Cambios"
            isEditing={true} // Prop opcional para que el form se adapte
          />
        )}
        {itemToEdit?.type === "file" && (
          <EditFileForm
            formData={editFormData}
            setFormData={setEditFormData} // Pasar el setter genérico o el handler
            groupsToShow={groupsToShow}
            onSubmit={handleUpdateItem}
            onCancel={closeEditModal}
            isLoading={isUpdating}
            error={editError}
          />
        )}
      </Modal>
      {/* ----------------------------------------------------- */}
    </div>
  );
}

export default HomePage;
