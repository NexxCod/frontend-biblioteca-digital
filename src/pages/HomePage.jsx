import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import folderService from '../services/folderService';
import fileService from '../services/fileService';
import groupService from '../services/groupService';
import Modal from '../components/Modal';
// import { Link } from 'react-router-dom'; // Opcional para futura navegación

// --- Iconos SVG Simples --- (Considera moverlos a /components/Icons.jsx)
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);
const FileIcon = ({ fileType }) => {
    let color = "text-gray-500";
    if (fileType === 'pdf') color = "text-red-500";
    else if (fileType === 'image') color = "text-blue-500";
    else if (fileType === 'word') color = "text-blue-700";
    else if (fileType === 'video_link') color = "text-red-700"; // YouTube red

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );
};
const CreateFolderIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm5 4a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
);
const UploadIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
     </svg>
);
const LinkIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5a.5.5 0 00.707 0l.707-.707a2 2 0 00-2.828-2.828l-3 3a2 2 0 000 2.828l9 9a2 2 0 002.828 0l3-3a2 2 0 000-2.828l-9-9z" clipRule="evenodd" />
      </svg>
);
// --- Fin Iconos ---


function HomePage() {
    const { user, logout, isLoading: isAuthLoading } = useAuth(); // Renombrar isLoading de useAuth

    // --- Estados ---
    const [currentFolder, setCurrentFolder] = useState(null);
    const [subfolders, setSubfolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [error, setError] = useState('');
    const [availableGroups, setAvailableGroups] = useState([]); // Para admin

    // Estados Modales
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [createFolderGroupId, setCreateFolderGroupId] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [createFolderError, setCreateFolderError] = useState('');

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadTags, setUploadTags] = useState('');
    const [uploadGroupId, setUploadGroupId] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [linkDescription, setLinkDescription] = useState('');
    const [linkTags, setLinkTags] = useState('');
    const [linkGroupId, setLinkGroupId] = useState('');
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [addLinkError, setAddLinkError] = useState('');


    // --- Función para Cargar Contenido ---
    const loadFolderContent = useCallback(async (folderId, folderObject = null) => {
        console.log("Cargando contenido para folderId:", folderId);
        setIsLoadingFolders(true);
        setIsLoadingFiles(true);
        setError('');
        setCurrentFolder(folderObject);

        try {
            const [folderData, fileData] = await Promise.all([
                folderService.listFolders(folderId),
                folderId ? fileService.listFiles(folderId) : Promise.resolve([]) // Solo carga archivos si hay folderId
            ]);
            setSubfolders(folderData || []);
            setFiles(fileData || []);
        } catch (err) {
            console.error("Error cargando contenido:", err);
            setError(err?.message || 'Error al cargar contenido.');
            setSubfolders([]);
            setFiles([]);
        } finally {
            setIsLoadingFolders(false);
            setIsLoadingFiles(false);
        }
    }, []);

     // --- Efecto para Cargar Grupos Disponibles (SI es Admin) ---
     useEffect(() => {
        const fetchAllGroupsForAdmin = async () => {
            if (user?.role === 'admin') {
                console.log("Admin detectado, cargando todos los grupos...");
                try {
                    const groupsData = await groupService.listGroups();
                    setAvailableGroups(groupsData || []);
                } catch (error) {
                    console.error("Admin: Error fetching all groups:", error);
                    setError(prev => `${prev} (No se pudieron cargar los grupos para asignar)`);
                }
            } else {
                setAvailableGroups([]); // Limpia si no es admin
            }
        };
        // Ejecutar si el usuario existe (después de la carga inicial de AuthContext)
        if (user && !isAuthLoading) {
             fetchAllGroupsForAdmin();
        }
     }, [user, isAuthLoading]); // Depende de user y del estado de carga de AuthContext

    // Efecto Inicial: Cargar Carpetas Raíz
    useEffect(() => {
        // Solo carga el contenido inicial si la autenticación NO está cargando y hay un usuario
        if (!isAuthLoading && user) {
            loadFolderContent(null);
        }
    }, [loadFolderContent, isAuthLoading, user]); // Depende de la función y del estado de auth

    // --- Handlers Navegación ---
    const handleFolderClick = (folder) => loadFolderContent(folder._id, folder);
    const handleBackClick = () => { if (currentFolder) loadFolderContent(currentFolder.parentFolder); };

    // --- Handlers Modales ---
    const openCreateFolderModal = () => { setNewFolderName(''); setCreateFolderGroupId(''); setCreateFolderError(''); setIsCreateFolderModalOpen(true); };
    const closeCreateFolderModal = () => setIsCreateFolderModalOpen(false);
    const handleCreateFolderSubmit = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) { setCreateFolderError('El nombre no puede estar vacío.'); return; }
        setIsCreatingFolder(true); setCreateFolderError('');
        try {
            await folderService.createFolder(newFolderName, currentFolder?._id, createFolderGroupId || null);
            closeCreateFolderModal();
            loadFolderContent(currentFolder?._id, currentFolder); // Refrescar
        } catch (error) { setCreateFolderError(error?.message || 'No se pudo crear la carpeta.'); }
        finally { setIsCreatingFolder(false); }
    };

    const openUploadModal = () => { setUploadFile(null); setUploadDescription(''); setUploadTags(''); setUploadGroupId(''); setUploadError(''); setIsUploadModalOpen(true); };
    const closeUploadModal = () => setIsUploadModalOpen(false);
    const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) { setUploadFile(e.target.files[0]); } else { setUploadFile(null); } };
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) { setUploadError('Debes seleccionar un archivo.'); return; }
        setIsUploading(true); setUploadError('');
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('folderId', currentFolder?._id || ''); // Backend requiere folderId
        formData.append('description', uploadDescription);
        formData.append('tags', uploadTags);
        if (uploadGroupId) formData.append('assignedGroupId', uploadGroupId);

        if (!currentFolder?._id) { // Prevenir subida en raíz si no está implementado/permitido
             setUploadError('Selecciona una carpeta antes de subir.');
             setIsUploading(false); return;
        }

        try {
            await fileService.uploadFile(formData);
            closeUploadModal();
            loadFolderContent(currentFolder?._id, currentFolder);
        } catch (error) { setUploadError(error?.message || 'No se pudo subir el archivo.'); }
        finally { setIsUploading(false); }
    };

     const openAddLinkModal = () => { setLinkUrl(''); setLinkTitle(''); setLinkDescription(''); setLinkTags(''); setLinkGroupId(''); setAddLinkError(''); setIsAddLinkModalOpen(true); };
    const closeAddLinkModal = () => setIsAddLinkModalOpen(false);
    const handleAddLinkSubmit = async (e) => {
        e.preventDefault();
        if (!linkUrl.trim() || !linkTitle.trim()) { setAddLinkError('La URL y el Título son obligatorios.'); return; }
        setIsAddingLink(true); setAddLinkError('');
        const payload = {
            youtubeUrl: linkUrl, title: linkTitle, description: linkDescription, tags: linkTags,
            folderId: currentFolder?._id, // Puede ser null si estamos en raíz
            assignedGroupId: linkGroupId || null
        };
         if (!payload.folderId) { // Prevenir añadir en raíz si no se permite
             setAddLinkError('Selecciona una carpeta antes de añadir un enlace.');
             setIsAddingLink(false); return;
         }
         try {
             await fileService.addVideoLink(payload);
             closeAddLinkModal();
             loadFolderContent(currentFolder?._id, currentFolder);
         } catch (error) { setAddLinkError(error?.message || 'No se pudo añadir el enlace.'); }
         finally { setIsAddingLink(false); }
    };

    // --- Determinar qué grupos mostrar en los desplegables ---
    const groupsToShow = user?.role === 'admin' ? availableGroups : user?.groups;

    // --- Renderizado ---
    const currentFolderName = currentFolder ? currentFolder.name : "Raíz";
    const canGoBack = currentFolder !== null;

     // Mostrar estado de carga principal mientras se autentica
     if (isAuthLoading) {
        return <div className="flex justify-center items-center h-screen">Verificando sesión...</div>;
     }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* --- Cabecera --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {/* Botón Atrás (condicional) */}
            {canGoBack && (
              <button
                onClick={handleBackClick}
                title="Volver"
                className="mr-3 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            Carpeta: {currentFolderName}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Usuario: {user?.username} ({user?.role})
          </p>
        </div>
        {/* --- Botones de Acción --- */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreateFolderModal}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none text-sm inline-flex items-center"
            title="Crear Nueva Carpeta"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm5 4a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1v-1a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Nueva Carpeta
          </button>
          <button
            onClick={openUploadModal}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none text-sm inline-flex items-center"
            title="Subir Archivo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Subir
          </button>
          <button
            onClick={openAddLinkModal}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 focus:outline-none text-sm inline-flex items-center"
            title="Añadir Enlace de Video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5a.5.5 0 00.707 0l.707-.707a2 2 0 00-2.828-2.828l-3 3a2 2 0 000 2.828l9 9a2 2 0 002.828 0l3-3a2 2 0 000-2.828l-9-9z"
                clipRule="evenodd"
              />
            </svg>
            Enlace
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 focus:outline-none text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mensaje de Error General */}
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>
      )}

      {/* --- Sección de Subcarpetas --- */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
          Subcarpetas
        </h2>
        {isLoadingFolders && (
          <p className="text-gray-500">Cargando carpetas...</p>
        )}
        {!isLoadingFolders && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subfolders.length > 0
              ? subfolders.map((folder) => (
                  <div
                    key={folder._id}
                    className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer border border-gray-200 text-center"
                    onClick={() => handleFolderClick(folder)}
                    title={folder.name}
                  >
                    <FolderIcon />
                    <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
                      {folder.name}
                    </p>
                  </div>
                ))
              : files.length === 0 && (
                  <p className="text-gray-500 text-sm col-span-full italic">
                    (Esta carpeta está vacía)
                  </p>
                ) // Solo muestra si archivos también está vacío
            }
          </div>
        )}
      </div>

      {/* --- Sección de Archivos/Enlaces --- */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
          Archivos y Enlaces
        </h2>
        {isLoadingFiles && (
          <p className="text-gray-500">Cargando archivos...</p>
        )}
        {!isLoadingFiles && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.length > 0
              ? files.map((file) => (
                  <div
                    key={file._id}
                    className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-200 text-center flex flex-col justify-between"
                    title={file.filename}
                  >
                    <div>
                      {" "}
                      {/* Contenedor para icono y nombre */}
                      <FileIcon fileType={file.fileType} />
                      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
                        {file.filename}
                      </p>
                    </div>
                    {/* Enlace/Botón para abrir */}
                    <a
                      href={file.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs text-blue-500 hover:underline block"
                      onClick={(e) => e.stopPropagation()} // Evita que se active el onClick del div (si lo tuviera)
                    >
                      {file.fileType === "video_link"
                        ? "Ver Video"
                        : "Abrir/Descargar"}
                    </a>
                  </div>
                ))
              : subfolders.length === 0 && (
                  <p className="text-gray-500 text-sm col-span-full italic">
                    (Esta carpeta está vacía)
                  </p>
                ) // Solo muestra si subcarpetas también está vacío
            }
          </div>
        )}
      </div>

      {/* --- Modal para Crear Carpeta --- */}
      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        title="Crear Nueva Carpeta"
      >
        <form onSubmit={handleCreateFolderSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newFolderName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de la Carpeta:
            </label>
            <input
              type="text"
              id="newFolderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
          </div>
          {/* NUEVO: Selector de Grupo */}
          <div className="mb-4">
            <label
              htmlFor="createFolderGroup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asignar a Grupo (Opcional):
            </label>
            
            <select
              id="createFolderGroup"
              value={createFolderGroupId}
              onChange={(e) => setCreateFolderGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Público (Ninguno)</option>{" "}
              {/* Opción para null */}
              {groupsToShow?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {createFolderError && (
            <p className="text-red-500 text-sm mb-3">{createFolderError}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateFolderModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
              disabled={isCreatingFolder}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreatingFolder}
              className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800 focus:outline-none ${
                isCreatingFolder ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isCreatingFolder ? "Creando..." : "Crear Carpeta"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Modal para Subir Archivo --- */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Subir Nuevo Archivo"
      >
        <form onSubmit={handleUploadSubmit}>
          {/* Input Archivo */}
          <div className="mb-4">
            <label
              htmlFor="fileUpload"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Archivo:
            </label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {/* Otros campos */}
          <div className="mb-4">
            <label
              htmlFor="uploadDesc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción (Opcional):
            </label>
            <textarea
              id="uploadDesc"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              htmlFor="uploadTags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Etiquetas (Opcional, separadas por coma):
            </label>
            <input
              type="text"
              id="uploadTags"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="uploadGroup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asignar a Grupo (Opcional):
            </label>
            <select
              id="uploadGroup"
              value={uploadGroupId}
              onChange={(e) => setUploadGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Público (Ninguno)</option>
              {groupsToShow?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {uploadError && (
            <p className="text-red-500 text-sm mb-3">{uploadError}</p>
          )}
          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeUploadModal}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 text-white bg-green-600 rounded hover:bg-green-800 focus:outline-none ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Subiendo..." : "Subir Archivo"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Modal para Añadir Enlace --- */}
      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={closeAddLinkModal}
        title="Añadir Enlace de Video (YouTube)"
      >
        <form onSubmit={handleAddLinkSubmit}>
          {/* Campos del formulario */}
          <div className="mb-4">
            <label
              htmlFor="linkUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL de YouTube:
            </label>
            <input
              type="url"
              id="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="linkTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título:
            </label>
            <input
              type="text"
              id="linkTitle"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="linkDesc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción (Opcional):
            </label>
            <textarea
              id="linkDesc"
              value={linkDescription}
              onChange={(e) => setLinkDescription(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              htmlFor="linkTags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Etiquetas (Opcional, separadas por coma):
            </label>
            <input
              type="text"
              id="linkTags"
              value={linkTags}
              onChange={(e) => setLinkTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="linkGroup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asignar a Grupo (Opcional):
            </label>
            <select
              id="linkGroup"
              value={linkGroupId}
              onChange={(e) => setLinkGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Público (Ninguno)</option>
              {groupsToShow?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {addLinkError && (
            <p className="text-red-500 text-sm mb-3">{addLinkError}</p>
          )}
          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddLinkModal}
              disabled={isAddingLink}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAddingLink}
              className={`px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-800 focus:outline-none ${
                isAddingLink ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isAddingLink ? "Añadiendo..." : "Añadir Enlace"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HomePage;
