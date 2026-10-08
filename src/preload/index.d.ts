import { ElectronAPI } from '@electron-toolkit/preload'

export interface NetworkInterfaceInfo {
  name: string
  address: string
  family: string
  internal: boolean
  mac: string
  blindedAddress?: string
}

export interface NetworkHealthResult {
  online: boolean
  latencyMs: number
  jitterMs: number
  packetLossPercent: number
  target: string
  timestamp: number
  dnsEncrypted?: boolean
  antiMitmVerified?: boolean
}

export interface PortalInfo {
  port: number
  localIp: string
  blindedVirtualIp: string
  portalUrl: string
  shareUrl: string
}

export interface AppReleaseInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  releaseTitle: string
  releaseDate: string
  releaseNotes: string[]
  downloadUrl?: string
}

export interface AegisApi {
  getNetworkInterfaces: () => Promise<NetworkInterfaceInfo[]>
  measureNetworkHealth: (target?: string) => Promise<NetworkHealthResult>
  getPortalInfo: () => Promise<PortalInfo>
  onPeerJoined: (callback: (peer: unknown) => void) => () => void
  updatePortalPackages: (packages: unknown[]) => Promise<boolean>
  onClientFeedback: (callback: (feedback: unknown) => void) => () => void
  onThreatDetected: (callback: (threat: unknown) => void) => () => void
  unbanIp: (ip: string) => Promise<boolean>
  simulateAttackVector: (vector: string) => Promise<boolean>
  checkForUpdates: () => Promise<AppReleaseInfo>
  triggerUpdateDownload: () => Promise<boolean>
  installUpdate: () => Promise<boolean>
  broadcastRelease: (release: { version: string; title: string; releaseNotes: string[] }) => Promise<boolean>
  onUpdateAvailable: (callback: (info: AppReleaseInfo) => void) => () => void
  onUpdateProgress: (callback: (progress: number) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AegisApi
  }
}
