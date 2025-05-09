import React, { useState, useEffect, useCallback, useRef } from "react";
// Importa useParams y useNavigate de react-router-dom
import { useParams, useNavigate } from "react-router-dom";
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

  // NUEVO: Usar useParams para obtener folderId de la URL
  const { folderId: folderIdFromUrl } = useParams();
  // NUEVO: Usar useNavigate para la navegación programática
  const navigate = useNavigate();

  const loadIdRef = useRef(0);

  const [currentFolder, setCurrentFolder] = useState(null);
  const [subfolders, setSubfolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // ELIMINADO: Ya no necesitamos folderIdToLoad, usaremos folderIdFromUrl directamente
  // const [folderIdToLoad, setFolderIdToLoad] = useState(null);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderGroupId, setCreateFolderGroupId] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [createFolderError, setCreateFolderError] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadGroupId, setUploadGroupId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkTags, setLinkTags] = useState("");
  const [linkGroupId, setLinkGroupId] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [addLinkError, setAddLinkError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const loadFolderContent = useCallback(
  async (
    folderIdToLoad,
    filterParams = {},
    operationId // ID de esta operación de carga específica
  ) => {
    const { /* extraer filterParams */ } = filterParams;

    console.log(`loadFolderContent (OpID: ${operationId}) INICIADO para folderId: ${folderIdToLoad}`);

    // Comprobar inmediatamente si esta operación sigue siendo la más reciente.
    // Hacemos esto ANTES de setIsLoading para evitar que una op vieja ponga isLoading=true
    // si una más nueva ya lo puso a false.
    if (operationId !== loadIdRef.current) {
      console.log(`Operación ${operationId} INMEDIATAMENTE ABORTADA (ya no es la más reciente: ${loadIdRef.current})`);
      // No tocar isLoading si no somos la operación actual, podría interrumpir una carga válida.
      return;
    }

    setIsLoadingFolders(true);
    setIsLoadingFiles(true);
    setError("");

    // Limpieza condicional de datos anteriores
    if (!folderIdToLoad) { // Si vamos a la raíz
        setSubfolders([]);
        setFiles([]);
        setCurrentFolder(null); // Explicitamente null para la raíz
    }
    // Si folderIdToLoad existe, NO limpiamos los datos aquí para evitar parpadeo.
    // Se sobrescribirán si la carga es exitosa.

    let tempTargetFolderObject = null;

    try {
      // Paso 1: Obtener detalles de la carpeta actual
      if (folderIdToLoad) {
        tempTargetFolderObject = await folderService.getFolderDetails(folderIdToLoad);
      }
      // (tempTargetFolderObject sigue siendo null si folderIdToLoad es null)

      // Antes de CUALQUIER setState, siempre verificar operationId
      if (operationId !== loadIdRef.current) {
        console.log(`Operación ${operationId} (post getFolderDetails) abortada. Reciente: ${loadIdRef.current}`);
        // Si abortamos, una carga más nueva podría estar en curso. No cambiar isLoading a false aquí.
        return;
      }
      setCurrentFolder(tempTargetFolderObject);

      // Paso 2: Cargar contenidos (subcarpetas y archivos)
      let fileResults = [];
      let subfolderResults = [];

      if (folderIdToLoad) { // Solo cargar archivos si estamos en una carpeta
        fileResults = await fileService.listFiles(folderIdToLoad, { /* ...filtros... */ })
          .catch(err => {
            console.error(`(OpID: ${operationId}) Error listando archivos:`, err);
            if (operationId !== loadIdRef.current) return []; // Doble chequeo por si la ref cambió durante el await
            // setError("Error al cargar archivos."); // Podrías setear un error parcial
            return [];
          });
      }

      // Siempre cargar subcarpetas (o carpetas raíz si folderIdToLoad es null)
      subfolderResults = await folderService.listFolders(folderIdToLoad)
        .catch(err => {
          console.error(`(OpID: ${operationId}) Error listando subcarpetas:`, err);
          if (operationId !== loadIdRef.current) return [];
          // setError("Error al cargar subcarpetas.");
          return [];
        });

      // VERIFICACIÓN FINAL antes de los últimos setStates
      if (operationId !== loadIdRef.current) {
        console.log(`Operación ${operationId} (post listContents) abortada. Reciente: ${loadIdRef.current}`);
        return;
      }

      console.log(`(OpID: ${operationId}) Resultados listFolders:`, subfolderResults);
      console.log(`(OpID: ${operationId}) Resultados listFiles:`, fileResults);

      setSubfolders(subfolderResults || []);
      setFiles(fileResults || []);

    } catch (errMain) { // Error principal, probablemente de getFolderDetails o un error no atrapado arriba
      if (operationId !== loadIdRef.current) {
        console.log(`Error de Operación ${operationId} ignorado (ya no es la más reciente: ${loadIdRef.current})`);
        return;
      }
      console.error(`(OpID: ${operationId}) Error Principal en loadFolderContent:`, errMain);
      setError(errMain?.response?.data?.message || errMain?.message || "Error al cargar contenido.");
      setCurrentFolder(null); // Si hay un error grave, la carpeta actual es indeterminada
      setSubfolders([]);
      setFiles([]);
    } finally {
      // Solo la operación que *sigue siendo* la más reciente debe desactivar los indicadores de carga.
      if (operationId === loadIdRef.current) {
        setIsLoadingFolders(false);
        setIsLoadingFiles(false);
      }
      console.log(`loadFolderContent (OpID: ${operationId}) FINALIZADO.`);
    }
  },
  [] // Dependencias de useCallback
);
  useEffect(() => {
    const fetchAllGroupsForAdmin = async () => {
      if (user?.role === "admin") {
        // [cite: 1138]
        try {
          const groupsData = await groupService.listGroups(); // [cite: 1138]
          setAvailableGroups(groupsData || []); // [cite: 1138]
        } catch (error) {
          // [cite: 1138]
          console.error("Admin: Error fetching all groups:", error); // [cite: 1139]
        }
      } else {
        setAvailableGroups([]); // [cite: 1139]
      }
    };
    if (user && !isAuthLoading) {
      // [cite: 1139]
      fetchAllGroupsForAdmin(); // [cite: 1139]
    }
  }, [user, isAuthLoading]); // [cite: 1139]

  // MODIFICADO: useEffect para cargar contenido basado en folderIdFromUrl y filtros
useEffect(() => {
  const currentUrlFolderId = folderIdFromUrl || null;
  const userIdString = user?._id;

   if (!isAuthLoading) {
    if (userIdString) { // Si hay un usuario logueado
      const newOperationId = loadIdRef.current + 1;
      loadIdRef.current = newOperationId; // Actualizar el ref INMEDIATAMENTE

    console.log(
        `Effect principal: Usuario CARGADO. folderId: ${currentUrlFolderId}, userId: ${userIdString}, operationId: ${newOperationId}`);
    loadFolderContent(currentUrlFolderId, {
      searchTerm,
      fileType: filterFileType,
      tags: filterTags,
      sortBy,
      sortOrder,
    }, newOperationId); // Pasar el nuevo ID de operación
  } else {
    setCurrentFolder(null);
    setSubfolders([]);
    setFiles([]);
    setError("");
    loadIdRef.current +=1; // Incrementar incluso si no hay usuario, para invalidar cargas previas si el estado de auth cambia rápido.
  }
} else {
  console.log("Effect principal: Autenticación aún en progreso (isAuthLoading es true).");
}
}, [folderIdFromUrl, searchTerm, filterFileType, filterTags, sortBy, sortOrder, isAuthLoading, user?._id, loadFolderContent]); // loadFolderContent es estable

  useEffect(() => {
    const fetchTags = async () => {
      if (!user || isAuthLoading) return; // [cite: 1146]
      try {
        const tagsData = await tagService.listTags(); // [cite: 1146]
        setAvailableTags(tagsData || []); // [cite: 1146]
      } catch (error) {
        // [cite: 1146]
        console.error("Error fetching available tags:", error); // [cite: 1147]
      }
    };
    fetchTags(); // [cite: 1147]
  }, [user, isAuthLoading]); // [cite: 1148]

  const openConfirmModal = (item, type) => {
    console.log("Abriendo confirmación para eliminar:", type, item); // [cite: 1148]
    setItemToDelete({ ...item, type }); // [cite: 1149]
    setDeleteError(""); // [cite: 1149]
    setIsConfirmModalOpen(true); // [cite: 1150]
  };

  const openConfirmModalWrapper = useCallback((item, type) => { // Envuelve con useCallback
  openConfirmModal(item, type); // Llama a la función original
}, []);

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false); // [cite: 1150]
    setTimeout(() => {
      // [cite: 1151]
      setItemToDelete(null); // [cite: 1151]
      setIsDeleting(false); // [cite: 1151]
      setDeleteError(""); // [cite: 1151]
    }, 300); // [cite: 1151]
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return; // [cite: 1152]
    setIsDeleting(true); // [cite: 1153]
    setDeleteError(""); // [cite: 1153]
    try {
      // [cite: 1153]
      if (itemToDelete.type === "file") {
        // [cite: 1153]
        console.log("Intentando eliminar archivo:", itemToDelete._id); // [cite: 1153]
        await fileService.deleteFile(itemToDelete._id); // [cite: 1154]
      } else if (itemToDelete.type === "folder") {
        // [cite: 1154]
        console.log("Intentando eliminar carpeta:", itemToDelete._id); // [cite: 1154]
        await folderService.deleteFolder(itemToDelete._id); // [cite: 1155]
      }
      console.log("Eliminación exitosa"); // [cite: 1155]
      closeConfirmModal(); // [cite: 1155]
      // MODIFICADO: Usar folderIdFromUrl o null para la raíz
      loadFolderContent(folderIdFromUrl || null, {
        // [cite: 1156]
        searchTerm, // [cite: 1156]
        fileType: filterFileType, // [cite: 1156]
        tags: filterTags, // [cite: 1156]
        sortBy, // [cite: 1156]
        sortOrder, // [cite: 1156]
      });
    } catch (error) {
      // [cite: 1157]
      console.error("Error al eliminar:", error); // [cite: 1157]
      setDeleteError(
        // [cite: 1158]
        error?.response?.data?.message || // [cite: 1158]
          error?.message || // [cite: 1158]
          "Error al eliminar el elemento." // [cite: 1158]
      );
    } finally {
      // [cite: 1159]
      setIsDeleting(false); // [cite: 1160]
    }
  };

  const openEditModal = (item, type) => {
    console.log("Abriendo modal para editar:", type, item); // [cite: 1160]
    setItemToEdit({ ...item, type }); // [cite: 1161]
    if (type === "folder") {
      // [cite: 1161]
      setEditFormData({
        // [cite: 1161]
        name: item.name || "", // [cite: 1161]
        assignedGroupId: item.assignedGroup?._id || "", // [cite: 1161]
      });
    } else {
      // [cite: 1162]
      setEditFormData({
        // [cite: 1162]
        filename: item.filename || "", // [cite: 1162]
        description: item.description || "", // [cite: 1162]
        tags: item.tags?.map((tag) => tag.name).join(", ") || "", // [cite: 1162]
        assignedGroupId: item.assignedGroup?._id || "", // [cite: 1162]
      });
    }
    setEditError(""); // [cite: 1163]
    setIsEditModalOpen(true); // [cite: 1163]
  };

  const openEditModalWrapper = useCallback((item, type) => { // Envuelve con useCallback
  openEditModal(item, type);
}, []); //

  const closeEditModal = () => {
    // [cite: 1164]
    setIsEditModalOpen(false); // [cite: 1164]
    setTimeout(() => {
      // [cite: 1165]
      setItemToEdit(null); // [cite: 1165]
      setEditFormData({}); // [cite: 1165]
      setIsUpdating(false); // [cite: 1165]
      setEditError(""); // [cite: 1165]
    }, 300); // [cite: 1165]
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target; // [cite: 1166]
    setEditFormData((prev) => ({ ...prev, [name]: value })); // [cite: 1167]
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault(); // [cite: 1167]
    if (!itemToEdit) return; // [cite: 1168]
    setIsUpdating(true); // [cite: 1168]
    setEditError(""); // [cite: 1168]
    try {
      // [cite: 1169]
      let updatedItem; // [cite: 1169]
      if (itemToEdit.type === "folder") {
        // [cite: 1169]
        const folderUpdateData = {
          // [cite: 1169]
          name: editFormData.name.trim(), // [cite: 1169]
          assignedGroupId: editFormData.assignedGroupId || null, // [cite: 1170]
        };
        console.log("Actualizando carpeta:", itemToEdit._id, folderUpdateData); // [cite: 1170]
        updatedItem = await folderService.updateFolder(
          // [cite: 1171]
          itemToEdit._id, // [cite: 1171]
          folderUpdateData // [cite: 1171]
        );
      } else {
        // [cite: 1172]
        const fileUpdateData = {
          // [cite: 1172]
          filename: editFormData.filename.trim(), // [cite: 1172]
          description: editFormData.description.trim(), // [cite: 1173]
          tags: editFormData.tags.trim(), // [cite: 1173]
          assignedGroupId: editFormData.assignedGroupId || null, // [cite: 1173]
        };
        console.log("Actualizando archivo:", itemToEdit._id, fileUpdateData); // [cite: 1173]
        updatedItem = await fileService.updateFile(
          // [cite: 1174]
          itemToEdit._id, // [cite: 1174]
          fileUpdateData // [cite: 1174]
        );
      }
      console.log("Actualización exitosa:", updatedItem); // [cite: 1175]
      closeEditModal(); // [cite: 1175]
      // MODIFICADO: Usar folderIdFromUrl o null
      loadFolderContent(folderIdFromUrl || null, {
        // [cite: 1176]
        searchTerm, // [cite: 1176]
        fileType: filterFileType, // [cite: 1176]
        tags: filterTags, // [cite: 1176]
        sortBy, // [cite: 1176]
        sortOrder, // [cite: 1176]
      });
    } catch (error) {
      // [cite: 1177]
      console.error("Error al actualizar:", error); // [cite: 1177]
      setEditError(
        // [cite: 1178]
        error?.response?.data?.message || // [cite: 1178]
          error?.message || // [cite: 1178]
          "Error al guardar los cambios." // [cite: 1178]
      );
    } finally {
      // [cite: 1179]
      setIsUpdating(false); // [cite: 1179]
    }
  };

  // MODIFICADO: handleFolderClick usa navigate
  const handleFolderClick = useCallback((folder) => {
    // Considera si estos reseteos son la causa principal de un re-render no deseado
    // justo antes de que la navegación y la carga de datos principal ocurran.
    setSearchTerm("");
    setFilterFileType("");
    setFilterTags([]);
    navigate(`/folder/${folder._id}`);
  }, [navigate]);

  // MODIFICADO: handleBackClick usa navigate
  const handleBackClick = () => {
    // Log para depuración
    console.log("Botón Volver (Jerárquico) presionado. currentFolder:", currentFolder);
    
    const parentId = currentFolder?.parentFolder || null; // Obtiene el ID de la carpeta padre
    
    console.log("Parent ID determinado:", parentId);

    // Resetea los filtros al subir de nivel.
    setSearchTerm(""); 
    setFilterFileType(""); 
    setFilterTags([]); 

    if (parentId) {
      console.log("Navegando a la carpeta padre jerárquica:", parentId);
      navigate(`/folder/${parentId}`);
    } else {
      console.log("No hay parentId o currentFolder es null, navegando a la raíz /");
      navigate("/");
    }
  };

  const openCreateFolderModal = () => {
    setNewFolderName(""); // [cite: 1188]
    setCreateFolderGroupId(""); // [cite: 1189]
    setCreateFolderError(""); // [cite: 1189]
    setIsCreateFolderModalOpen(true); // [cite: 1189]
  };
  const closeCreateFolderModal = () => setIsCreateFolderModalOpen(false); // [cite: 1189]

  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault(); // [cite: 1190]
    if (!newFolderName.trim()) {
      // [cite: 1191]
      setCreateFolderError("El nombre no puede estar vacío."); // [cite: 1191]
      return; // [cite: 1191]
    }
    setIsCreatingFolder(true); // [cite: 1191]
    setCreateFolderError(""); // [cite: 1192]
    try {
      // [cite: 1192]
      // MODIFICADO: Pasar folderIdFromUrl como parentFolderId si existe, sino null
      await folderService.createFolder(
        // [cite: 1192]
        newFolderName, // [cite: 1192]
        folderIdFromUrl || null, // Usar el ID de la URL actual como padre
        createFolderGroupId || null // [cite: 1192]
      );
      closeCreateFolderModal(); // [cite: 1193]
      // MODIFICADO: Usar folderIdFromUrl o null
      loadFolderContent(folderIdFromUrl || null); // Refrescar // [cite: 1193]
    } catch (error) {
      // [cite: 1193]
      setCreateFolderError(error?.message || "No se pudo crear la carpeta."); // [cite: 1193]
    } finally {
      // [cite: 1194]
      setIsCreatingFolder(false); // [cite: 1194]
    }
  };

  const openUploadModal = () => {
    setUploadFile(null); // [cite: 1195]
    setHasFileSelected(false); // [cite: 1196]
    setUploadDescription(""); // [cite: 1196]
    setUploadTags(""); // [cite: 1196]
    setUploadGroupId(""); // [cite: 1197]
    setUploadError(""); // [cite: 1198]
    setUploadProgress(0); // [cite: 1198]
    setIsUploadModalOpen(true); // [cite: 1198]
  };
  const closeUploadModal = () => setIsUploadModalOpen(false); // [cite: 1198]

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // [cite: 1199]
    if (file) {
      // [cite: 1200]
      setUploadFile(file); // [cite: 1200]
      setHasFileSelected(true); // [cite: 1200]
      setUploadError(""); // [cite: 1200]
    } else {
      // [cite: 1201]
      setUploadFile(null); // [cite: 1202]
      setHasFileSelected(false); // [cite: 1202]
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault(); // [cite: 1203]
    // MODIFICADO: currentFolder ahora se basa en folderIdFromUrl, asegurarse que exista
    const targetFolderIdForUpload = folderIdFromUrl || currentFolder?._id;

    if (!uploadFile || !targetFolderIdForUpload) {
      // [cite: 1204]
      setUploadError(
        // [cite: 1204]
        "Selecciona un archivo y asegúrate de estar dentro de una carpeta." // [cite: 1204]
      );
      return; // [cite: 1205]
    }

    setIsUploading(true); // [cite: 1205]
    setUploadError(""); // [cite: 1205]
    setUploadProgress(0); // [cite: 1205]

    const formData = new FormData(); // [cite: 1205]
    formData.append("file", uploadFile); // [cite: 1206]
    formData.append("folderId", targetFolderIdForUpload); // Usa el ID correcto // [cite: 1206]
    if (uploadDescription) formData.append("description", uploadDescription); // [cite: 1207]
    if (uploadTags) formData.append("tags", uploadTags); // [cite: 1208]
    if (uploadGroupId) formData.append("assignedGroupId", uploadGroupId); // [cite: 1208]

    try {
      // [cite: 1209]
      await fileService.uploadFile(formData, (progress) => {
        // [cite: 1209]
        setUploadProgress(progress); // [cite: 1209]
      });
      closeUploadModal(); // [cite: 1210]
      loadFolderContent(targetFolderIdForUpload); // Refrescar contenido // [cite: 1210]
    } catch (error) {
      // [cite: 1210]
      console.error("Error subiendo archivo:", error); // [cite: 1210]
      setUploadError(
        // [cite: 1211]
        error?.response?.data?.message || // [cite: 1211]
          error?.message || // [cite: 1211]
          "Error al subir el archivo." // [cite: 1211]
      );
      setUploadProgress(0); // [cite: 1212]
    } finally {
      // [cite: 1212]
      setIsUploading(false); // [cite: 1212]
    }
  };

  const openAddLinkModal = () => {
    setLinkUrl(""); // [cite: 1213]
    setLinkTitle(""); // [cite: 1213]
    setLinkDescription(""); // [cite: 1213]
    setLinkTags(""); // [cite: 1214]
    setLinkGroupId(""); // [cite: 1215]
    setAddLinkError(""); // [cite: 1215]
    setIsAddLinkModalOpen(true); // [cite: 1215]
  };
  const closeAddLinkModal = () => setIsAddLinkModalOpen(false); // [cite: 1215]

  const handleAddLinkSubmit = async (e) => {
    e.preventDefault(); // [cite: 1216]
    const targetFolderIdForLink = folderIdFromUrl || currentFolder?._id;

    if (!linkUrl.trim() || !linkTitle.trim() || !targetFolderIdForLink) {
      // [cite: 1217]
      setAddLinkError(
        // [cite: 1217]
        "La URL del video y el título son obligatorios. Asegúrate de estar en una carpeta." // [cite: 1217]
      );
      return; // [cite: 1218]
    }

    setIsAddingLink(true); // [cite: 1218]
    setAddLinkError(""); // [cite: 1218]
    const payload = {
      // [cite: 1219]
      url: linkUrl.trim(), // [cite: 1219]
      title: linkTitle.trim(), // [cite: 1219]
      description: linkDescription.trim(), // [cite: 1219]
      tags: linkTags.trim(), // [cite: 1219]
      folderId: targetFolderIdForLink, // [cite: 1219]
      assignedGroupId: linkGroupId || null, // [cite: 1220]
    };

    try {
      // [cite: 1220]
      await fileService.addLink(payload); // [cite: 1221]
      closeAddLinkModal(); // [cite: 1221]
      loadFolderContent(targetFolderIdForLink); // [cite: 1221]
    } catch (error) {
      // [cite: 1222]
      console.error("Error añadiendo enlace:", error); // [cite: 1222]
      setAddLinkError(
        // [cite: 1223]
        error?.response?.data?.message || // [cite: 1223]
          error?.message || // [cite: 1223]
          "Error al añadir el enlace." // [cite: 1223]
      );
    } finally {
      // [cite: 1224]
      setIsAddingLink(false); // [cite: 1224]
    }
  };

  const groupsToShow = user?.role === "admin" ? availableGroups : user?.groups; // [cite: 1225]

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // [cite: 1226]
  };
  const handleFileTypeFilterChange = (e) => {
    // [cite: 1228]
    setFilterFileType(e.target.value); // [cite: 1228]
  };
  const handleTagFilterChange = (e) => {
    // [cite: 1230]
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      // [cite: 1230]
      (option) => option.value // [cite: 1230]
    );
    setFilterTags(selectedOptions); // [cite: 1231]
  };
  const handleSortByChange = (e) => {
    // [cite: 1232]
    setSortBy(e.target.value); // [cite: 1232]
  };
  const handleSortOrderChange = (e) => {
    // [cite: 1233]
    setSortOrder(e.target.value); // [cite: 1233]
  };
  const handleToggleFilterPanel = () => {
    // [cite: 1234]
    setIsFilterPanelOpen((prev) => !prev); // [cite: 1234]
  };

  // MODIFICADO: mainTitle y canGoBack dependen de folderIdFromUrl (o currentFolder que se actualiza con él)
  const mainTitle = currentFolder ? currentFolder.name : "Inicio"; // [cite: 1235]
  const canGoBack = !!folderIdFromUrl; // Hay un ID en la URL, así que podemos volver (a la raíz o a otra carpeta)

  const folderSectionTitle =
    folderIdFromUrl || currentFolder ? "Subcarpetas" : "Carpetas"; // [cite: 1236]

  const showEmptyFolderMessage = // [cite: 1237]
    !isLoadingFolders && // [cite: 1237]
    !isLoadingFiles && // [cite: 1237]
    !error && // [cite: 1237]
    subfolders.length === 0 && // [cite: 1237]
    files.length === 0; // [cite: 1237]

  const showEmptyFilesMessage = // [cite: 1238]
    (folderIdFromUrl || currentFolder) && // [cite: 1238]
    !isLoadingFiles && // [cite: 1238]
    !error && // [cite: 1238]
    files.length === 0 && // [cite: 1238]
    subfolders.length > 0; // [cite: 1238]

  if (isAuthLoading) {
    // [cite: 1239]
    return (
      // [cite: 1239]
      <div className="flex justify-center items-center h-screen">
        Verificando sesión...
      </div>
    );
  }

  const shouldShowFileGridEmptyMessage =
    !isLoadingFiles && // La carga de archivos debe haber terminado
    !error && // No debe haber un error general
    (!files || files.length === 0) && // No hay archivos
    (folderIdFromUrl || currentFolder); // Debemos estar dentro de una carpeta (no en la raíz mostrando solo carpetas)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <HomeHeader
        canGoBack={canGoBack}
        handleBackClick={handleBackClick}
        currentFolderName={mainTitle}
        user={user}
        currentFolder={currentFolder} // Sigue siendo útil para habilitar/deshabilitar botones de acción
        openCreateFolderModal={openCreateFolderModal}
        openUploadModal={openUploadModal} // [cite: 1241]
        openAddLinkModal={openAddLinkModal} // [cite: 1241]
        logout={logout} // [cite: 1241]
      />

      {error && ( // [cite: 1241]
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p> // [cite: 1241]
      )}
      {(isLoadingFolders || isLoadingFiles) &&
        !subfolders.length &&
        !files.length && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center z-20">
            <p>Cargando contenido...</p> {/* O un spinner */}
          </div>
        )}

      <div className="mb-8">
        {(isLoadingFolders || subfolders.length > 0) &&
          !error && ( // [cite: 1242]
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
              {folderSectionTitle}
            </h2>
          )}
        <FolderGrid
          folders={subfolders}
          onFolderClick={handleFolderClick} // [cite: 1243]
          onDeleteClick={openConfirmModalWrapper} // [cite: 1243]
          onEditClick={openEditModalWrapper} // [cite: 1243]
          user={user} // [cite: 1243]
        />
        {showEmptyFolderMessage && ( // [cite: 1243]
          <p className="text-gray-500 text-sm italic pt-2 pl-2">
            {folderIdFromUrl || currentFolder // [cite: 1244]
              ? "(Esta carpeta está vacía)" // [cite: 1245]
              : "(No hay carpetas raíz creadas)"}
          </p>
        )}
      </div>

      {/* MODIFICADO: La sección de archivos se muestra si hay un folderId en la URL o si currentFolder (de la raíz) está definido */}
      {(folderIdFromUrl || currentFolder) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 border-b pb-1">
            {" "}
            {/* [cite: 1246] */}
            {(isLoadingFiles || files.length > 0 || isFilterPanelOpen) &&
              !error && ( // [cite: 1246]
                <h2 className="text-lg font-semibold text-gray-700">
                  {" "}
                  {/* [cite: 1246] */}
                  Archivos y Enlaces {/* [cite: 1247] */}
                </h2>
              )}
            <button // [cite: 1248]
              onClick={handleToggleFilterPanel} // [cite: 1248]
              className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300" // [cite: 1248]
              aria-expanded={isFilterPanelOpen} // [cite: 1248]
              aria-controls="filter-panel" // [cite: 1248]
              title={isFilterPanelOpen ? "Ocultar Filtros" : "Mostrar Filtros"} // [cite: 1249]
            >
              <SearchIcon /> {/* [cite: 1249] */}
            </button>
          </div>

          {isFilterPanelOpen && ( // [cite: 1250]
            <div
              id="filter-panel" // [cite: 1250]
              className="mb-6 p-3 bg-gray-100 rounded-lg shadow-sm flex flex-wrap gap-3 items-center transition-all duration-300 ease-in-out" // [cite: 1250]
            >
              <div className="flex-1 min-w-[150px] max-w-[250px]">
                {" "}
                {/* [cite: 1251] */}
                <label
                  htmlFor="search"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Buscar:
                </label>{" "}
                {/* [cite: 1251] */}
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Nombre, descripción..."
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs"
                />{" "}
                {/* [cite: 1252] */}
              </div>
              <div>
                {" "}
                {/* [cite: 1252] */}
                <label
                  htmlFor="filterFileType"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Tipo:
                </label>{" "}
                {/* [cite: 1252] */}
                <select
                  id="filterFileType"
                  value={filterFileType}
                  onChange={handleFileTypeFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                >
                  {" "}
                  {/* [cite: 1253] */}
                  <option value="">Todos</option> {/* [cite: 1253] */}
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                  <option value="excel">Excel</option>
                  <option value="pptx">PowerPoint</option>
                  <option value="image">Imagen</option>
                  <option value="video_link">Enlace Video</option>
                  <option value="generic_link">Enlace Genérico</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="other">Otro</option> {/* [cite: 1253] */}
                </select>
              </div>
              <div>
                {" "}
                {/* [cite: 1254] */}
                <label
                  htmlFor="filterTags"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Etiquetas:
                </label>{" "}
                {/* [cite: 1254] */}
                <select
                  id="filterTags"
                  multiple
                  value={filterTags}
                  onChange={handleTagFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs h-auto min-h-[28px]"
                >
                  {" "}
                  {/* [cite: 1255] */}
                  {availableTags.map((tag) => (
                    <option key={tag._id} value={tag._id}>
                      {tag.name}
                    </option>
                  ))}{" "}
                  {/* [cite: 1255] */}
                </select>
              </div>
              <div>
                {" "}
                {/* [cite: 1256] */}
                <label
                  htmlFor="sortBy"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Ordenar por:
                </label>{" "}
                {/* [cite: 1256] */}
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                >
                  {" "}
                  {/* [cite: 1256] */}
                  <option value="createdAt">Fecha Creación</option>
                  <option value="filename">Nombre</option> {/* [cite: 1257] */}
                </select>
              </div>
              <div>
                {" "}
                {/* [cite: 1257] */}
                <label
                  htmlFor="sortOrder"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Dir:
                </label>{" "}
                {/* [cite: 1258] */}
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                >
                  {" "}
                  {/* [cite: 1258] */}
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option> {/* [cite: 1258] */}
                </select>
              </div>
            </div>
          )}
          <FileGrid
            files={files}
            isLoading={isLoadingFiles}
            showEmptyMessage={shouldShowFileGridEmptyMessage} // <--- PASA LA PROP ASÍ
            onDeleteClick={openConfirmModalWrapper}
            onEditClick={openEditModalWrapper}
            user={user}
          />
        </div>
      )}

      <Modal
        isOpen={isCreateFolderModalOpen} // [cite: 1261]
        onClose={closeCreateFolderModal} // [cite: 1261]
        title="Crear Nueva Carpeta" // [cite: 1261]
      >
        <CreateFolderForm // [cite: 1262]
          groupsToShow={groupsToShow} // [cite: 1262]
          folderName={newFolderName} // [cite: 1262]
          setFolderName={setNewFolderName} // [cite: 1262]
          groupId={createFolderGroupId} // [cite: 1262]
          setGroupId={setCreateFolderGroupId} // [cite: 1262]
          onSubmit={handleCreateFolderSubmit} // [cite: 1262]
          onCancel={closeCreateFolderModal} // [cite: 1262]
          isLoading={isCreatingFolder} // [cite: 1262]
          error={createFolderError} // [cite: 1262]
        />
      </Modal>
      <Modal
        isOpen={isUploadModalOpen} // [cite: 1263]
        onClose={closeUploadModal} // [cite: 1263]
        title="Subir Nuevo Archivo" // [cite: 1263]
      >
        <UploadFileForm
          groupsToShow={groupsToShow} // [cite: 1263]
          description={uploadDescription} // [cite: 1263]
          setDescription={setUploadDescription} // [cite: 1263]
          tags={uploadTags} // [cite: 1263]
          setTags={setUploadTags} // [cite: 1264]
          groupId={uploadGroupId} // [cite: 1264]
          setGroupId={setUploadGroupId} // [cite: 1264]
          onFileChange={handleFileChange} // [cite: 1264]
          onSubmit={handleUploadSubmit} // [cite: 1264]
          onCancel={closeUploadModal} // [cite: 1264]
          isLoading={isUploading} // [cite: 1264]
          error={uploadError} // [cite: 1264]
          hasFileSelected={hasFileSelected} // [cite: 1264]
          uploadProgress={uploadProgress} // [cite: 1264]
        />
      </Modal>
      <Modal
        isOpen={isAddLinkModalOpen} // [cite: 1265]
        onClose={closeAddLinkModal} // [cite: 1265]
        title="Añadir Enlace de Video (YouTube)" // [cite: 1265]
      >
        <AddLinkForm
          groupsToShow={groupsToShow} // [cite: 1265]
          linkUrl={linkUrl} // [cite: 1265]
          setLinkUrl={setLinkUrl} // [cite: 1265]
          linkTitle={linkTitle} // [cite: 1265]
          setLinkTitle={setLinkTitle} // [cite: 1266]
          linkDescription={linkDescription} // [cite: 1266]
          setLinkDescription={setLinkDescription} // [cite: 1266]
          linkTags={linkTags} // [cite: 1266]
          setLinkTags={setLinkTags} // [cite: 1266]
          linkGroupId={linkGroupId} // [cite: 1266]
          setLinkGroupId={setLinkGroupId} // [cite: 1266]
          onSubmit={handleAddLinkSubmit} // [cite: 1266]
          onCancel={closeAddLinkModal} // [cite: 1266]
          isLoading={isAddingLink} // [cite: 1266]
          error={addLinkError} // [cite: 1267]
        />
      </Modal>
      <Modal
        isOpen={isConfirmModalOpen} // [cite: 1267]
        onClose={closeConfirmModal} // [cite: 1267]
        title="Confirmar Eliminación" // [cite: 1267]
      >
        <div className="text-center">
          {" "}
          {/* [cite: 1267] */}
          <p className="mb-4">
            ¿Estás seguro de que quieres eliminar {/* [cite: 1268] */}
            <strong>
              "{itemToDelete?.name || itemToDelete?.filename}"
            </strong>? {/* [cite: 1269] */}
          </p>
          {deleteError && ( // [cite: 1269]
            <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
              {deleteError}
            </p>
          )}
          <div className="flex justify-center gap-4">
            {" "}
            {/* [cite: 1270] */}
            <button
              type="button" // [cite: 1270]
              onClick={closeConfirmModal} // [cite: 1270]
              disabled={isDeleting} // [cite: 1270]
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none" // [cite: 1270]
            >
              Cancelar {/* [cite: 1271] */}
            </button>
            <button
              type="button" // [cite: 1271]
              onClick={handleDeleteItem} // [cite: 1271]
              disabled={isDeleting} // [cite: 1271]
              className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800 focus:outline-none ${
                // [cite: 1271]
                isDeleting ? "opacity-50 cursor-not-allowed" : "" // [cite: 1272]
              }`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"} {/* [cite: 1272] */}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isEditModalOpen} // [cite: 1273]
        onClose={closeEditModal} // [cite: 1273]
        title={`Editar ${
          // [cite: 1273]
          itemToEdit?.type === "folder" ? "Carpeta" : "Archivo/Enlace" // [cite: 1274]
        }`}
      >
        {itemToEdit?.type === "folder" && ( // [cite: 1274]
          <CreateFolderForm // Reutilizamos CreateFolderForm // [cite: 1274]
            folderName={editFormData.name} // [cite: 1274]
            setFolderName={
              (
                value // [cite: 1274]
              ) => setEditFormData((prev) => ({ ...prev, name: value })) // [cite: 1275]
            }
            groupId={editFormData.assignedGroupId} // [cite: 1275]
            setGroupId={
              (
                value // [cite: 1275]
              ) =>
                setEditFormData((prev) => ({ ...prev, assignedGroupId: value })) // [cite: 1275]
            }
            groupsToShow={groupsToShow} // [cite: 1275]
            onSubmit={handleUpdateItem} // Usar el handler de update // [cite: 1276]
            onCancel={closeEditModal} // [cite: 1276]
            isLoading={isUpdating} // [cite: 1276]
            error={editError} // [cite: 1276]
            submitButtonText="Guardar Cambios" // [cite: 1276]
            isEditing={true} // Prop opcional para que el form se adapte // [cite: 1277]
          />
        )}
        {itemToEdit?.type === "file" && ( // [cite: 1277]
          <EditFileForm
            formData={editFormData} // [cite: 1277]
            setFormData={setEditFormData} // Pasar el setter genérico o el handler // [cite: 1277]
            groupsToShow={groupsToShow} // [cite: 1277]
            onSubmit={handleUpdateItem} // [cite: 1278]
            onCancel={closeEditModal} // [cite: 1278]
            isLoading={isUpdating} // [cite: 1278]
            error={editError} // [cite: 1278]
          />
        )}
      </Modal>
    </div>
  );
}

export default HomePage;
