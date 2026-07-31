import { useState, useEffect, useRef } from 'react'
import { create } from 'zustand'

// ---- Types ----
export type Platform = 'windows' | 'mac' | 'linux' | 'android' | 'ios'
export type ConnectionStatus = 'connected' | 'disconnected' | 'searching'

export interface Peer {
  id: string
  name: string
  platform: Platform
  status: 'online' | 'offline' | 'connecting'
  hasInternet: boolean
  isProvider: boolean
  uploadKbps: number
  downloadKbps: number
  latency: number
  dataUsed: number // bytes
  connectedSince: number // timestamp
  score?: number // Intelligent routing score
}

export interface SpeedPoint {
  time: string
  upload: number
  download: number
}

interface AegisState {
  // My device
  myId: string
  myName: string
  myPlatform: Platform
  hasInternet: boolean
  isProvider: boolean
  uploadKbps: number
  downloadKbps: number

  // Peers
  peers: Peer[]

  // Network
  connectionStatus: ConnectionStatus
  autoSwitch: boolean
  totalDataShared: number // bytes

  // Quotas & Score Engine
  globalQuota: number // bytes (0 for unlimited)
  peerQuotas: Record<string, number> // peerId -> bytes limit

  // Speed history
  speedHistory: SpeedPoint[]

  // Pairing
  inviteCode: string | null
  inviteLink: string | null

  // Actions
  setAutoSwitch: (val: boolean) => void
  setMyName: (name: string) => void
  setGlobalQuota: (bytes: number) => void
  setPeerQuota: (peerId: string, bytes: number) => void
  generateInvite: () => void
  clearInvite: () => void
  disconnectPeer: (id: string) => void
  addMockPeer: (peer: Peer) => void
  tick: () => void
}

// ---- Helpers ----
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// ---- Initial Mock Peers ----
const INITIAL_PEERS: Peer[] = [
  {
    id: 'peer-001',
    name: "Javaln's MacBook",
    platform: 'mac',
    status: 'online',
    hasInternet: true,
    isProvider: true,
    uploadKbps: 850,
    downloadKbps: 3200,
    latency: 28,
    dataUsed: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    connectedSince: Date.now() - 3600000,
    score: 0,
  },
  {
    id: 'peer-002',
    name: 'Android Phone',
    platform: 'android',
    status: 'online',
    hasInternet: true,
    isProvider: false,
    uploadKbps: 120,
    downloadKbps: 480,
    latency: 65,
    dataUsed: 420 * 1024 * 1024, // 420 MB
    connectedSince: Date.now() - 1800000,
    score: 0,
  },
  {
    id: 'peer-003',
    name: 'Office PC',
    platform: 'windows',
    status: 'offline',
    hasInternet: false,
    isProvider: false,
    uploadKbps: 0,
    downloadKbps: 0,
    latency: 0,
    dataUsed: 2.8 * 1024 * 1024 * 1024, // 2.8 GB
    connectedSince: Date.now() - 86400000,
    score: 0,
  },
]

// ---- Zustand Store ----
export const useAegisStore = create<AegisState>((set, get) => ({
  myId: 'local-' + Math.random().toString(36).slice(2, 8),
  myName: 'My Device',
  myPlatform: 'windows',
  hasInternet: false, // We act as consumer to see the score engine switch between peers
  isProvider: false,
  uploadKbps: 0,
  downloadKbps: 0,

  peers: INITIAL_PEERS,
  connectionStatus: 'connected',
  autoSwitch: true,
  totalDataShared: 4.4 * 1024 * 1024 * 1024,

  globalQuota: 0, // unlimited
  peerQuotas: {}, // unlimited by default

  speedHistory: Array.from({ length: 30 }, (_, i) => ({
    time: formatTime(new Date(Date.now() - (29 - i) * 2000)),
    upload: randomBetween(100, 900),
    download: randomBetween(500, 4000),
  })),

  inviteCode: null,
  inviteLink: null,

  setAutoSwitch: (val) => set({ autoSwitch: val }),
  setMyName: (name) => set({ myName: name }),
  setGlobalQuota: (bytes) => set({ globalQuota: bytes }),
  setPeerQuota: (peerId, bytes) => set((s) => ({ peerQuotas: { ...s.peerQuotas, [peerId]: bytes } })),

  generateInvite: () => {
    const code = generateCode()
    set({
      inviteCode: code,
      inviteLink: `aegis://join?code=${code}&id=${get().myId}`,
    })
  },

  clearInvite: () => set({ inviteCode: null, inviteLink: null }),

  disconnectPeer: (id) =>
    set((s) => ({
      peers: s.peers.map((p) =>
        p.id === id ? { ...p, status: 'offline' as const, uploadKbps: 0, downloadKbps: 0, isProvider: false } : p,
      ),
    })),

  addMockPeer: (peer) => set((s) => ({ peers: [...s.peers, peer] })),

  tick: () => {
    const now = new Date()
    const state = get()
    const newPoint: SpeedPoint = {
      time: formatTime(now),
      upload: randomBetween(80, 1200),
      download: randomBetween(400, 5000),
    }
    const newHistory = [...state.speedHistory.slice(-59), newPoint]

    // Animate peer speeds
    const updatedPeers = state.peers.map((p) =>
      p.status === 'online'
        ? {
            ...p,
            uploadKbps: randomBetween(50, 1100),
            downloadKbps: randomBetween(200, 4500),
            latency: Math.max(10, p.latency + randomBetween(-5, 5)), // Don't let latency drop below 10
            dataUsed: p.dataUsed + randomBetween(1000, 50000),
          }
        : p,
    )

    // --- Intelligent Score Engine ---
    // Simulating auto-switch if we don't have internet natively
    if (!state.hasInternet && state.autoSwitch) {
      let bestPeer = null
      let highestScore = -Infinity

      updatedPeers.forEach((p) => {
        if (p.status === 'online' && p.hasInternet) {
          // Check quotas
          const quota = state.peerQuotas[p.id] || 0
          if (quota > 0 && p.dataUsed >= quota) {
            p.score = -999 // Exhausted quota
            return
          }

          // Score Formula: (Bandwidth * 0.05) - (Latency * 2) + (Reliability)
          const bandwidthScore = (p.uploadKbps + p.downloadKbps) * 0.05
          const latencyPenalty = p.latency * 2
          const uptimeMinutes = (Date.now() - p.connectedSince) / 60000
          const reliabilityScore = Math.min(100, uptimeMinutes) * 10 

          const score = Math.round(bandwidthScore - latencyPenalty + reliabilityScore)
          p.score = score

          if (score > highestScore) {
            highestScore = score
            bestPeer = p
          }
        } else {
          p.score = 0
        }
      })

      // Hysteresis: Only switch if the new score is significantly better
      const currentProvider = updatedPeers.find((p) => p.isProvider)
      const threshold = currentProvider ? (currentProvider.score || 0) + 50 : -Infinity

      if (bestPeer && highestScore > threshold) {
        updatedPeers.forEach((p) => {
          p.isProvider = p.id === bestPeer?.id
        })
      } else if (currentProvider && currentProvider.score === -999) {
          // Provider exhausted quota, need to switch even if not much better
           updatedPeers.forEach((p) => {
               p.isProvider = bestPeer ? p.id === bestPeer.id : false
           })
      }
    }

    set({
      speedHistory: newHistory,
      peers: updatedPeers,
      uploadKbps: newPoint.upload,
      downloadKbps: newPoint.download,
      totalDataShared: state.totalDataShared + randomBetween(5000, 100000),
    })
  },
}))

// ---- Custom Hooks ----
export function useAegisTick(intervalMs = 2000) {
  const tick = useAegisStore((s) => s.tick)
  useEffect(() => {
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [tick, intervalMs])
}

export function useFormatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
