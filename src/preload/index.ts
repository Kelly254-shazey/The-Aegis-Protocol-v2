import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AegisApi } from './index.d'

// Custom APIs for renderer
const api: AegisApi = {
  getNetworkInterfaces: () => ipcRenderer.invoke('network:get-interfaces'),
  measureNetworkHealth: (target?: string) => ipcRenderer.invoke('network:measure-health', target),
  getPortalInfo: () => ipcRenderer.invoke('portal:get-info'),
  onPeerJoined: (callback: (peer: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on('peer-joined', handler)
    return () => {
      ipcRenderer.removeListener('peer-joined', handler)
    }
  },
  updatePortalPackages: (packages: unknown[]) => ipcRenderer.invoke('admin:update-packages', packages),
  onClientFeedback: (callback: (feedback: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on('client-feedback', handler)
    return () => {
      ipcRenderer.removeListener('client-feedback', handler)
    }
  },
  onThreatDetected: (callback: (threat: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on('threat-detected', handler)
    return () => {
      ipcRenderer.removeListener('threat-detected', handler)
    }
  },
  unbanIp: (ip: string) => ipcRenderer.invoke('admin:unban-ip', ip),
  simulateAttackVector: (vector: string) => ipcRenderer.invoke('admin:simulate-attack', vector),
  checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
  triggerUpdateDownload: () => ipcRenderer.invoke('app:download-update'),
  installUpdate: () => ipcRenderer.invoke('app:install-update'),
  broadcastRelease: (release: { version: string; title: string; releaseNotes: string[] }) =>
    ipcRenderer.invoke('admin:broadcast-release', release),
  onUpdateAvailable: (callback: (info: any) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: any) => callback(data)
    ipcRenderer.on('update-available', handler)
    return () => {
      ipcRenderer.removeListener('update-available', handler)
    }
  },
  onUpdateProgress: (callback: (progress: number) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: number) => callback(data)
    ipcRenderer.on('update-progress', handler)
    return () => {
      ipcRenderer.removeListener('update-progress', handler)
    }
  }
}

// Expose in main world if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
