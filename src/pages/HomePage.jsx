import React, { useState, useEffect, useCallback } from "react";
// Quitamos useRef si no lo usamos para debounce de filtros aún
import HomeHeader from "../components/HomeHeader";
import { useAuth } from "../contexts/AuthContext";
import folderService from "../services/folderService";
import fileService from "../services/fileService";
import groupService from "../services/groupService";
import Modal from "../components/Modal";
import FolderGrid from "../components/FolderGrid";
import FileGrid from "../components/FileGrid";
import CreateFolderForm from "../components/CreateFolderForm";
import UploadFileForm from "../components/UploadFileForm";
import AddLinkForm from "../components/AddLinkForm";

// Asegúrate que HomeHeader tiene acceso a los iconos necesarios

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

  // Estados Modales AddLink
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkTags, setLinkTags] = useState("");
  const [linkGroupId, setLinkGroupId] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [addLinkError, setAddLinkError] = useState("");

  // --- Función para Cargar Contenido (useCallback) ---
  const loadFolderContent = useCallback(
    async (folderId) => {
      console.log("Cargando contenido para folderId:", folderId);
      let targetFolderObject = null;
      setIsLoadingFolders(true); // Iniciar carga general
       if (folderId) setIsLoadingFiles(true); else setFiles([]);
      setError('');

      try {
          // Paso 1: Obtener el objeto de la carpeta actual (o null si es la raíz)
          if (folderId) {
              targetFolderObject = await folderService.getFolderDetails(folderId);
          } else {
              targetFolderObject = null; // Es la raíz
          }
          // Actualizar el estado de la carpeta actual AHORA que tenemos el objeto correcto
          setCurrentFolder(targetFolderObject);

           // Paso 2: Cargar subcarpetas y archivos para este folderId
           const [subfolderResults, fileResults] = await Promise.all([
              folderService.listFolders(folderId),
              folderId ? fileService.listFiles(folderId) : Promise.resolve([])
           ]);
           setSubfolders(subfolderResults || []);
           setFiles(fileResults || []);

      } catch (err) {
           console.error(`Error cargando contenido para folderId ${folderId}:`, err);
           setError(err?.response?.data?.message || err?.message || 'Error al cargar contenido.');
           setSubfolders([]);
           setFiles([]);
           // Considera qué hacer con currentFolder en caso de error.
           // ¿Quizás volver a la raíz o al estado anterior? Por ahora lo dejamos.
           // setCurrentFolder(null); // Opción: ir a raíz en error
      } finally {
           setIsLoadingFolders(false);
           if (folderId) setIsLoadingFiles(false);
      }
  }, []); // Ya no depende de currentFolder._id

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
    // Log para depurar el estado al momento de ejecutar el efecto
    console.log(
      "Effect inicial - isAuthLoading:", isAuthLoading,
      "user:", !!user, // Loguear si el usuario existe (true/false)
      "currentFolder:", currentFolder // Loguear el objeto currentFolder directamente
    );

    // --- CONDICIÓN SIMPLIFICADA ---
    // Ejecutar si la autenticación terminó, hay un usuario, y estamos en la vista raíz (currentFolder es null)
    if (!isAuthLoading && user && currentFolder === null) {
      console.log("Effect inicial: Llamando loadFolderContent(null)");
      loadFolderContent(null);
    }
    // --- DEPENDENCIAS ---
    // loadFolderContent (definida con useCallback), isAuthLoading y user son necesarias
    // Añadimos currentFolder porque la condición if() ahora depende directamente de él.
  }, [loadFolderContent, isAuthLoading, user, currentFolder]);

  // --- Handlers Navegación ---
  // Estos simplemente llaman a loadFolderContent, que ahora está memoizada correctamente (esperemos)
  const handleFolderClick = (folder) => loadFolderContent(folder._id);
  const handleBackClick = () => {
    // Obtenemos el ID del padre desde el estado currentFolder actual
     const parentId = currentFolder?.parentFolder || null; // Si no hay parentFolder, es null (raíz)
     loadFolderContent(parentId);
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
    setIsUploadModalOpen(true);
  };
  const closeUploadModal = () =>  setIsUploadModalOpen(false);

  const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            setHasFileSelected(true); // Archivo seleccionado
            setUploadError(''); // Limpiar error si selecciona un archivo nuevo
        } else {
            setUploadFile(null);
            setHasFileSelected(false); // No hay archivo
        }
    };

 const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile || !currentFolder) { // Necesitamos archivo y carpeta destino
            setUploadError('Selecciona un archivo y asegúrate de estar dentro de una carpeta.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

         // Crear FormData
         const formData = new FormData();
         formData.append('file', uploadFile); // El archivo en sí [cite: 393]
         formData.append('folderId', currentFolder._id); // ID de la carpeta actual [cite: 10, 37]
         if (uploadDescription) formData.append('description', uploadDescription); // [cite: 10]
         if (uploadTags) formData.append('tags', uploadTags); // [cite: 10]
         if (uploadGroupId) formData.append('assignedGroupId', uploadGroupId); // [cite: 10, 13]
 
         try {
             // Llamar al servicio
             await fileService.uploadFile(formData); // [cite: 16]
             closeUploadModal();
             loadFolderContent(currentFolder._id, currentFolder); // Refrescar contenido
         } catch (error) {
             console.error("Error subiendo archivo:", error);
             setUploadError(error?.response?.data?.message || error?.message || 'Error al subir el archivo.'); // [cite: 42]
         } finally {
             setIsUploading(false);
         }
     };


  // --- Handlers Modales Add Link ---
  const openAddLinkModal = () => {
    setLinkUrl('');
    setLinkTitle('');
    setLinkDescription('');
    setLinkTags('');
    // setLinkGroupId(currentFolder?.assignedGroup?._id || ''); // Ejemplo: Heredar grupo
    setLinkGroupId(''); // Empezar con público
    setAddLinkError('');
    setIsAddLinkModalOpen(true);
};
const closeAddLinkModal = () => setIsAddLinkModalOpen(false);

// IMPLEMENTACIÓN: Manejar submit de añadir enlace
const handleAddLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim() || !currentFolder) {
        setAddLinkError('La URL del video y el título son obligatorios. Asegúrate de estar en una carpeta.');
        return;
    }
    // Podrías añadir validación extra de URL aquí si quieres

    setIsAddingLink(true);
    setAddLinkError('');

    // Crear payload JSON
    const payload = {
        youtubeUrl: linkUrl.trim(), // [cite: 77]
        title: linkTitle.trim(), // [cite: 77]
        description: linkDescription.trim(), // [cite: 77]
        tags: linkTags.trim(), // [cite: 77]
        folderId: currentFolder._id, // [cite: 77]
        assignedGroupId: linkGroupId || null // [cite: 77]
    };

    try {
        // Llamar al servicio
        await fileService.addVideoLink(payload); // [cite: 17]
        closeAddLinkModal();
        loadFolderContent(currentFolder._id, currentFolder); // Refrescar contenido
    } catch (error) {
        console.error("Error añadiendo enlace:", error);
        setAddLinkError(error?.response?.data?.message || error?.message || 'Error al añadir el enlace.'); // [cite: 101]
    } finally {
        setIsAddingLink(false);
    }
};

  // --- Determinar qué grupos mostrar en los desplegables ---
  const groupsToShow = user?.role === "admin" ? availableGroups : user?.groups;

  // --- Variables para Renderizado (Con ajustes para UI Raíz) ---
  const mainTitle = currentFolder ? `${currentFolder.name}` : "Home";
  const canGoBack = currentFolder !== null;
  const folderSectionTitle = currentFolder ? "Subcarpetas" : "Carpetas";
  // Condición para mostrar mensaje de "vacío"
  const showEmptyFolderMessage = !isLoadingFolders && !isLoadingFiles && !error && subfolders.length === 0 && files.length === 0; // Mensaje de carpeta totalmente vacía
    const showEmptyFilesMessage = currentFolder && !isLoadingFiles && !error && files.length === 0 && subfolders.length > 0; // Mensaje si hay carpetas pero no archivos

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
          isLoading={isLoadingFolders}
          onFolderClick={handleFolderClick}
        />
        {/* Mensaje específico si solo subcarpetas está vacío pero hay archivos (y no estamos en raíz) */}
        {/* Mensaje si la carpeta está TOTALMENTE vacía */}
        {showEmptyFolderMessage && (
                        <p className="text-gray-500 text-sm italic pt-2 pl-2">
                             {currentFolder ? '(Esta carpeta está vacía)' : '(No hay carpetas raíz creadas)'}
                         </p>
                   )}
      </div>

      {/* --- Sección de Archivos/Enlaces (CONDICIONAL) --- */}
      {currentFolder && (
                   <div className="mt-8">
                       {/* Título */}
                       {(isLoadingFiles || files.length > 0) && !error && (
                         <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
                              Archivos y Enlaces
                         </h2>
                       )}
                       {/* Grid */}
                       <FileGrid
                           files={files}
                           isLoading={isLoadingFiles}
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
    </div>
  );
}

export default HomePage;
