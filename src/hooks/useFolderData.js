// src/hooks/useFolderData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import folderService from '../services/folderService';
import fileService from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';

function useFolderData(folderIdFromUrl, filters) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentFolder, setCurrentFolder] = useState(null);
  const [subfolders, setSubfolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // MANTENER EN TRUE INICIALMENTE
  const [error, setError] = useState('');
  const loadIdRef = useRef(0);
  const prevFolderIdRef = useRef(folderIdFromUrl); // Para detectar cambio de carpeta

  const { searchTerm, fileType, tags, sortBy, sortOrder } = filters;

  const loadData = useCallback(async (operationId) => {
    if (!user || isAuthLoading) {
      // Si la autenticación aún está en progreso o no hay usuario,
      // no iniciamos la carga de datos de carpetas.
      // Si la autenticación TERMINÓ y NO hay usuario, limpiamos.
      if (!isAuthLoading && !user) {
        setCurrentFolder(null);
        setSubfolders([]);
        setFiles([]);
        setError('');
      }
      setIsLoading(false); // Indicar que la carga (o intento) terminó.
      return;
    }

    if (operationId !== loadIdRef.current) {
      // console.log(`(OpID: ${operationId}) Abortada, no es la más reciente.`);
      return;
    }

    // console.log(`(OpID: ${operationId}) Iniciando carga para folderId: ${folderIdFromUrl}`);
    setIsLoading(true); // Asegurar que isLoading sea true al iniciar la carga real
    setError('');

    // Si folderIdFromUrl cambió (navegación), limpiamos los datos actuales ANTES de cargar los nuevos.
    // Esto es para evitar mostrar datos de la carpeta anterior mientras cargan los de la nueva.
    if (prevFolderIdRef.current !== folderIdFromUrl) {
        // console.log(`(OpID: ${operationId}) folderId cambió. Limpiando datos anteriores.`);
        setCurrentFolder(null);
        setSubfolders([]);
        setFiles([]);
        prevFolderIdRef.current = folderIdFromUrl; // Actualizar la referencia del folderId previo
    } else if (!folderIdFromUrl && operationId === 1) { // Caso de carga inicial en la raíz
        // console.log(`(OpID: ${operationId}) Carga inicial en la raíz. Limpiando por si acaso.`);
        setCurrentFolder(null);
        setSubfolders([]);
        setFiles([]);
    }


    let tempTargetFolderObject = null;

    try {
      if (folderIdFromUrl) {
        tempTargetFolderObject = await folderService.getFolderDetails(folderIdFromUrl);
      }

      if (operationId !== loadIdRef.current) { /* console.log(`(OpID: ${operationId}) Abortada post getFolderDetails.`); */ return; }
      setCurrentFolder(tempTargetFolderObject);

      const fileParams = { search: searchTerm, fileType, tags: tags?.join(','), sortBy, sortOrder };
      Object.keys(fileParams).forEach(key => {
  if (!fileParams[key] || (Array.isArray(fileParams[key]) && fileParams[key].length === 0)) {
    // Esta condición es para que si searchTerm es "", !fileParams[key] (donde key es 'search')
    // se evalúe a true y se borre el parámetro 'search'.
    delete fileParams[key];
  }
      });

      // Usamos allSettled para que un error en una no detenga la otra
      const [subfolderResults, fileResults] = await Promise.allSettled([
        folderService.listFolders(folderIdFromUrl),
        folderIdFromUrl ? fileService.listFiles(folderIdFromUrl, fileParams) : Promise.resolve([])
      ]);

      if (operationId !== loadIdRef.current) { /* console.log(`(OpID: ${operationId}) Abortada post listContents.`); */ return; }

      if (subfolderResults.status === 'fulfilled') {
        setSubfolders(Array.isArray(subfolderResults.value) ? subfolderResults.value : []);
      } else {
        console.error(`(OpID: ${operationId}) Error listando subcarpetas:`, subfolderResults.reason);
        setSubfolders([]); // Limpiar si falla
        // Podrías acumular errores si quieres mostrar más de uno
        setError(subfolderResults.reason?.response?.data?.message || subfolderResults.reason?.message || 'Error al cargar subcarpetas.');
      }

      if (fileResults.status === 'fulfilled') {
        setFiles(Array.isArray(fileResults.value) ? fileResults.value : []);
      } else {
        console.error(`(OpID: ${operationId}) Error listando archivos:`, fileResults.reason);
        setFiles([]); // Limpiar si falla
        // Podrías acumular errores
        setError(prevError => prevError ? `${prevError}\n${fileResults.reason?.response?.data?.message || fileResults.reason?.message || 'Error al cargar archivos.'}` : (fileResults.reason?.response?.data?.message || fileResults.reason?.message || 'Error al cargar archivos.'));
      }
    } catch (errMain) { // Error en getFolderDetails o un error muy general
      if (operationId !== loadIdRef.current) { return; }
      console.error(`(OpID: ${operationId}) Error Principal en loadData:`, errMain);
      setError(errMain?.response?.data?.message || errMain?.message || "Error al cargar contenido.");
      setCurrentFolder(null);
      setSubfolders([]);
      setFiles([]);
    } finally {
      if (operationId === loadIdRef.current) {
        setIsLoading(false);
        // console.log(`(OpID: ${operationId}) Carga finalizada. isLoading: false`);
      }
    }
  }, [user, isAuthLoading, folderIdFromUrl, searchTerm, fileType, tags, sortBy, sortOrder]);


  // Efecto para la carga de datos (inicial, navegación, o cambio de filtros)
  useEffect(() => {
    // console.log(`Effect (loadData) disparado. folderIdFromUrl: ${folderIdFromUrl}, AuthLoading: ${isAuthLoading}, User: ${!!user}`);
    if (!isAuthLoading) { // Solo actuar si la autenticación ha terminado
        const newOperationId = loadIdRef.current + 1;
        loadIdRef.current = newOperationId;
        // console.log(`(OpID: ${newOperationId}) Llamando a loadData desde effect principal.`);
        loadData(newOperationId);
    } else {
        // Si la autenticación está en progreso, nos aseguramos que isLoading sea true.
        setIsLoading(true);
    }
  }, [folderIdFromUrl, searchTerm, fileType, tags, sortBy, sortOrder, user, isAuthLoading, loadData]);
  // Incluimos loadData aquí porque sus dependencias (user, isAuthLoading, folderIdFromUrl, filters) son las mismas
  // que queremos que disparen la recarga. React se encargará de la memoización de loadData si sus dependencias no cambian.


  const refreshData = useCallback(() => {
    if (!isAuthLoading && user) {
      const newOperationId = loadIdRef.current + 1;
      loadIdRef.current = newOperationId;
      // console.log(`(OpID: ${newOperationId}) refreshData llamado.`);
      return loadData(newOperationId);
    }
    return Promise.resolve();
  }, [loadData, isAuthLoading, user]); // loadData es dependencia aquí

  return { currentFolder, subfolders, files, isLoading, error, refreshData };
}

export default useFolderData;