import React, { useState, useEffect, useCallback } from 'react';
// Quitamos useRef si no lo usamos para debounce de filtros aún
import HomeHeader from '../components/HomeHeader';
import { useAuth } from '../contexts/AuthContext';
import folderService from '../services/folderService';
import fileService from '../services/fileService';
import groupService from '../services/groupService';
import Modal from '../components/Modal';
import FolderGrid from '../components/FolderGrid';
import FileGrid from '../components/FileGrid';
import CreateFolderForm from '../components/CreateFolderForm';
import UploadFileForm from '../components/UploadFileForm';
import AddLinkForm from '../components/AddLinkForm';

// Asegúrate que HomeHeader tiene acceso a los iconos necesarios

function HomePage() {
    const { user, logout, isLoading: isAuthLoading } = useAuth();

    // --- Estados ---
    const [currentFolder, setCurrentFolder] = useState(null);
    const [subfolders, setSubfolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [error, setError] = useState('');
    const [availableGroups, setAvailableGroups] = useState([]);

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

    // --- Función para Cargar Contenido (useCallback con dependencia) ---
    const loadFolderContent = useCallback(async (folderId, folderObject = null) => {
        console.log("Cargando contenido para folderId:", folderId);
        // Comparamos con el ID actual para evitar re-seteos innecesarios si ya estamos ahí
        // Aunque setCurrentFolder se puede llamar varias veces con el mismo valor sin problema
        if ((currentFolder?._id || null) !== folderId) {
             setCurrentFolder(folderObject);
        }
        setIsLoadingFolders(true);
        if (folderId) setIsLoadingFiles(true); else setFiles([]); // Limpia archivos si vamos a raíz
        setError('');

        try {
            const [folderData, fileData] = await Promise.all([
                folderService.listFolders(folderId),
                // Llama a listFiles SIN parámetros de filtro adicionales por ahora
                folderId ? fileService.listFiles(folderId) : Promise.resolve([])
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
             if (folderId) setIsLoadingFiles(false);
        }
    // *** CORRECCIÓN CLAVE: Añadir currentFolder?._id como dependencia ***
    // Aunque no lo usemos mucho DENTRO, el hecho de que la función *pueda* leerlo
    // y que el comportamiento dependa del estado *actual* justifica incluirlo
    // para evitar potenciales problemas de 'stale closure'.
    // Alternativamente, si la lógica interna NO dependiera NUNCA de currentFolder,
    // podríamos dejar [], pero se vuelve más difícil de razonar.
    }, [currentFolder?._id]);


    // --- Efecto para Cargar Grupos Disponibles (SI es Admin) ---
    useEffect(() => {
        const fetchAllGroupsForAdmin = async () => {
            if (user?.role === 'admin') {
                try {
                    const groupsData = await groupService.listGroups();
                    setAvailableGroups(groupsData || []);
                } catch (error) { console.error("Admin: Error fetching all groups:", error); }
            } else { setAvailableGroups([]); }
        };
        if (user && !isAuthLoading) { fetchAllGroupsForAdmin(); }
    }, [user, isAuthLoading]);

    // --- Efecto Inicial: Cargar Carpetas Raíz ---
    useEffect(() => {
        if (!isAuthLoading && user && !currentFolder) { // Carga inicial solo si currentFolder es null
            loadFolderContent(null);
        }
    // Añadimos 'currentFolder' aquí también; si currentFolder cambia a null (ej, por logout o error),
    // y el usuario sigue presente, intentará cargar la raíz.
    }, [loadFolderContent, isAuthLoading, user, currentFolder]);

    // --- Handlers Navegación ---
    // Estos simplemente llaman a loadFolderContent, que ahora está memoizada correctamente (esperemos)
    const handleFolderClick = (folder) => loadFolderContent(folder._id, folder);
    const handleBackClick = () => { if (currentFolder) loadFolderContent(currentFolder.parentFolder); };


    // --- Handlers Modales (sin cambios en su lógica interna) ---
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
    // ... (resto de handlers open/close/submit para Upload y AddLink sin cambios)...
     const openUploadModal = () => { /*...*/ }; const closeUploadModal = () => {/*...*/}; const handleFileChange = (e) => {/*...*/}; const handleUploadSubmit = async (e) => { /*...*/ };
     const openAddLinkModal = () => { /*...*/ }; const closeAddLinkModal = () => {/*...*/}; const handleAddLinkSubmit = async (e) => { /*...*/ };


    // --- Determinar qué grupos mostrar en los desplegables ---
    const groupsToShow = user?.role === 'admin' ? availableGroups : user?.groups;

    // --- Variables para Renderizado (Con ajustes para UI Raíz) ---
    const mainTitle = currentFolder ? `${currentFolder.name}` : "Home";
    const canGoBack = currentFolder !== null;
    const folderSectionTitle = currentFolder ? "Subcarpetas" : "Carpetas";
    // Condición para mostrar mensaje de "vacío"
    


     if (isAuthLoading) {
        return <div className="flex justify-center items-center h-screen">Verificando sesión...</div>;
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
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

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
                 {!isLoadingFolders && !isLoadingFiles && !error && subfolders.length === 0 && files.length === 0 && (
                      <p className="text-gray-500 text-sm italic pt-2 pl-2"> {/* Añadí padding top */}
                          {currentFolder ? '(Esta carpeta está vacía)' : '(No hay carpetas raíz creadas)'}
                      </p>
                 )}
             </div>

             {/* --- Sección de Archivos/Enlaces (CONDICIONAL) --- */}
             {/* Solo se renderiza si currentFolder NO es null */}
             {currentFolder && (
                 <div className="mt-8"> {/* Div contenedor */}
                 {/* 1. Muestra Título SOLO si está cargando o si hay archivos */}
                 {(isLoadingFiles || files.length > 0) && !error && (
                    <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
                        Archivos y Enlaces
                    </h2>
                 )}

                 {/* 2. Muestra el Grid (que maneja su propio 'cargando' o muestra items) */}
                 <FileGrid
                     files={files}
                     isLoading={isLoadingFiles} // FileGrid mostrará 'Cargando...' si es true
                     // Ya no necesita showEmptyMessage
                 />

                  {/* 3. Muestra Mensaje de Vacío específico para archivos (si hay carpetas pero no archivos) */}
                   {!isLoadingFiles && !error && files.length === 0 && subfolders.length > 0 && (
                      <p className="text-gray-500 text-sm italic pt-2 pl-2"> {/* Añadí padding top */}
                          (No hay archivos o enlaces)
                      </p>
                  )}
                  {/* El mensaje de vacío TOTAL ya se maneja arriba */}
             </div>
             )}
             {/* Fin de la sección condicional */}


            {/* --- Modales --- */}
             <Modal isOpen={isCreateFolderModalOpen} onClose={closeCreateFolderModal} title="Crear Nueva Carpeta"><CreateFolderForm groupsToShow={groupsToShow} folderName={newFolderName} setFolderName={setNewFolderName} groupId={createFolderGroupId} setGroupId={setCreateFolderGroupId} onSubmit={handleCreateFolderSubmit} onCancel={closeCreateFolderModal} isLoading={isCreatingFolder} error={createFolderError} /></Modal>
             <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title="Subir Nuevo Archivo"><UploadFileForm groupsToShow={groupsToShow} description={uploadDescription} setDescription={setUploadDescription} tags={uploadTags} setTags={setUploadTags} groupId={uploadGroupId} setGroupId={setUploadGroupId} onFileChange={handleFileChange} selectedFile={uploadFile} onSubmit={handleUploadSubmit} onCancel={closeUploadModal} isLoading={isUploading} error={uploadError} /></Modal>
             <Modal isOpen={isAddLinkModalOpen} onClose={closeAddLinkModal} title="Añadir Enlace de Video (YouTube)"><AddLinkForm groupsToShow={groupsToShow} linkUrl={linkUrl} setLinkUrl={setLinkUrl} linkTitle={linkTitle} setLinkTitle={setLinkTitle} linkDescription={linkDescription} setLinkDescription={setLinkDescription} linkTags={linkTags} setLinkTags={setLinkTags} linkGroupId={linkGroupId} setLinkGroupId={setLinkGroupId} onSubmit={handleAddLinkSubmit} onCancel={closeAddLinkModal} isLoading={isAddingLink} error={addLinkError} /></Modal>

        </div>
    );
}

export default HomePage;