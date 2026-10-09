// ==============================================================================
// THE AEGIS PROTOCOL — LAPTOP INGRESS PROVIDER UPLINK DAEMON
// Connects this Laptop's Broadband/ISP pipeline UP to the Azure Cloud Relay
// Enables remote mobile clients to route internet through this Ingress Node
// ==============================================================================

const https = require('https')
const http = require('http')

const CLOUD_URL = 'https://172-209-217-140.sslip.io'
const PROVIDER_ID = 'provider-laptop-master'
const PROVIDER_NAME = 'Master Laptop Ingress Gateway'
const LOCATION = 'Residential Broadband Ingress'
const BANDWIDTH_MBPS = 100

console.log('==================================================================')
console.log('🛡️  THE AEGIS PROTOCOL — INGRESS PROVIDER NODE INITIALIZING')
console.log(`🌐 Target Cloud Relay: ${CLOUD_URL}`)
console.log(`📡 Ingress Identity:   ${PROVIDER_NAME} (${PROVIDER_ID})`)
console.log(`⚡ Max Pipeline:        ${BANDWIDTH_MBPS} Mbps Broadband Uplink`)
console.log('==================================================================')

function registerProvider() {
  const payload = JSON.stringify({
    id: PROVIDER_ID,
    name: PROVIDER_NAME,
    type: 'home_router',
    location: LOCATION,
    bandwidthMbps: BANDWIDTH_MBPS,
    isHomeRouter: true
  })

  const url = new URL(CLOUD_URL + '/api/provider/register')
  const req = https.request(
    {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 8000
    },
    (res) => {
      let body = ''
      res.on('data', (d) => (body += d))
      res.on('end', () => {
        try {
          const data = JSON.parse(body)
          if (data.status === 'registered') {
            console.log(`[✓] Ingress Successfully Registered with Cloud Relay!`)
            console.log(`[✓] Blinded Virtual IP: ${data.uplink.blindedIp}`)
            console.log(`[✓] Security Shield:    ${data.uplink.antiMitmShield}`)
            console.log(`[✓] Uplink Pipeline:    ACTIVE 24/7 (Broadband -> Cloud Channel)`)
          } else {
            console.log(`[!] Cloud response:`, body)
          }
        } catch {
          console.log(`[!] Registered (raw):`, body)
        }
      })
    }
  )

  req.on('error', (err) => {
    console.error(`[X] Uplink connection error:`, err.message)
  })

  req.on('timeout', () => {
    req.destroy()
    console.warn(`[!] Uplink timeout connecting to ${CLOUD_URL}`)
  })

  req.write(payload)
  req.end()
}

// Initial registration
registerProvider()

// Periodic heartbeat & channel keepalive every 30 seconds
setInterval(() => {
  const start = Date.now()
  https
    .get(CLOUD_URL + '/api/ping', { timeout: 5000 }, (res) => {
      const lat = Date.now() - start
      console.log(`[♥] Channel Heartbeat: OK (${lat}ms latency to Azure South Africa Relay)`)
    })
    .on('error', (err) => {
      console.warn(`[!] Heartbeat failed:`, err.message)
    })
}, 30000)
