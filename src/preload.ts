const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    connect: (gameLink, cookie, name) => ipcRenderer.send('connect', gameLink, cookie, name)
})

console.log("preload")