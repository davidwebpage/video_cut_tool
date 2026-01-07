const { ipcRenderer } = require('electron');

// 由于contextIsolation: false，直接暴露API给window对象
window.electronAPI = {
  // 文件操作
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectExportPath: (defaultFileName) => ipcRenderer.invoke('select-export-path', defaultFileName),
  selectExportDirectory: () => ipcRenderer.invoke('select-export-directory'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  
  // 视频处理
  getVideoMetadata: (filePath) => ipcRenderer.invoke('get-video-metadata', filePath),
  cutVideo: (params) => ipcRenderer.invoke('cut-video', params),
  
  // 外部链接
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // 事件监听
  onImportVideo: (callback) => ipcRenderer.on('import-video', callback),
  onExportVideo: (callback) => ipcRenderer.on('export-video', callback),
  onCutProgress: (callback) => ipcRenderer.on('cut-progress', callback),
  
  // 移除事件监听
  removeOnImportVideo: () => ipcRenderer.removeAllListeners('import-video'),
  removeOnExportVideo: () => ipcRenderer.removeAllListeners('export-video'),
  removeOnCutProgress: () => ipcRenderer.removeAllListeners('cut-progress'),
  
  // 快捷键设置
  closeShortcutsWindow: () => ipcRenderer.send('close-shortcuts-window'),
  updateShortcuts: (shortcuts) => ipcRenderer.send('update-shortcuts', shortcuts),
  onShortcutsUpdated: (callback) => ipcRenderer.on('shortcuts-updated', callback),
};