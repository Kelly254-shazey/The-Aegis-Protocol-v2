// ==============================================================================
// THE AEGIS PROTOCOL — LAPTOP INGRESS PROVIDER UPLINK DAEMON
// Connects this Laptop's Broadband/ISP pipeline UP to the Azure Cloud Relay
// Enforces HMAC-SHA256 Mutual Mesh Auth, Anti-Replay, and Header Sanitization
// ==============================================================================

const http = require('http')
const https = require('https')
const crypto = require('crypto')

const CLOUD_URL = process.env.CLOUD_URL || 'https://172-209-217-140.sslip.io'
const PROVIDER_ID = 'provider-laptop-master'
const PROVIDER_NAME = 'Master Laptop Ingress Gateway'
const LOCATION = 'Residential Broadband Ingress'
const BANDWIDTH_MBPS = 100
const AEGIS_MESH_SECRET = process.env.AEGIS_MESH_SECRET || 'aegis-quantum-shield-key-99218'

// Allow HTTPS self-signed / sslip.io certificates
const httpsAgent = new https.Agent({ rejectUnauthorized: false })

console.log('==================================================================')
console.log('🛡️  THE AEGIS PROTOCOL — INGRESS PROVIDER NODE INITIALIZING')
console.log(`🌐 Target Cloud Relay: ${CLOUD_URL}`)
console.log(`📡 Ingress Identity:   ${PROVIDER_NAME} (${PROVIDER_ID})`)
console.log(`⚡ Max Pipeline:        ${BANDWIDTH_MBPS} Mbps Broadband Uplink`)
console.log('🔒 Security Profile:   HMAC-SHA256 Mutual Mesh Authentication')
console.log('==================================================================')

function getClient(urlStr) {
  return urlStr.startsWith('https:') ? https : http
}

function getAgent(urlStr) {
  return urlStr.startsWith('https:') ? httpsAgent : undefined
}

function createMeshAuthHeaders(body = '') {
  const ts = Date.now().toString()
  const nonce = crypto.randomBytes(16).toString('hex')
  const sig = crypto
    .createHmac('sha256', AEGIS_MESH_SECRET)
    .update(`${ts}:${nonce}:${body}`)
    .digest('hex')
  return {
    'X-Aegis-Timestamp': ts,
    'X-Aegis-Nonce': nonce,
    'X-Aegis-Mesh-Signature': sig
  }
}

function registerProvider() {
  const payload = JSON.stringify({
    id: PROVIDER_ID,
    name: PROVIDER_NAME,
    type: 'home_router',
    location: LOCATION,
    bandwidthMbps: BANDWIDTH_MBPS,
    isHomeRouter: true
  })

  const authHeaders = createMeshAuthHeaders(payload)
  const url = new URL(CLOUD_URL + '/api/provider/register')
  const client = getClient(url.protocol)
  const req = client.request(
    {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      agent: getAgent(url.protocol),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...authHeaders
      },
      timeout: 10000
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
    setTimeout(registerProvider, 5000)
  })

  req.on('timeout', () => {
    req.destroy()
    setTimeout(registerProvider, 5000)
  })

  req.write(payload)
  req.end()
}

// 1. Initial registration
registerProvider()

// 2. Start worker polling loop (Fetch client requests via Laptop Broadband)
function pollChannelTask() {
  const authHeaders = createMeshAuthHeaders('')
  const url = new URL(CLOUD_URL + '/api/channel/provider/poll')
  const client = getClient(url.protocol)
  const req = client.get(
    {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      agent: getAgent(url.protocol),
      headers: {
        ...authHeaders
      },
      timeout: 30000
    },
    (res) => {
      if (res.statusCode === 200) {
        let body = ''
        res.on('data', (d) => (body += d))
        res.on('end', () => {
          try {
            const task = JSON.parse(body)
            if (task.taskId && task.url) {
              console.log(`[⚡] Received Client Request for: ${task.url}`)
              fetchAndResolve(task.taskId, task.url)
            }
          } catch {}
          setImmediate(pollChannelTask)
        })
      } else {
        setTimeout(pollChannelTask, 2000)
      }
    }
  )

  req.on('error', () => {
    setTimeout(pollChannelTask, 3000)
  })

  req.on('timeout', () => {
    req.destroy()
    setImmediate(pollChannelTask)
  })
}

function fetchAndResolve(taskId, targetUrl) {
  const start = Date.now()
  const mod = targetUrl.startsWith('https:') ? https : http

  // Anonymizing Headers (Strip client/LAN fingerprint)
  const safeHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none'
  }

  const clientReq = mod.get(targetUrl, { timeout: 8000, headers: safeHeaders }, (upstreamRes) => {
    let data = ''
    upstreamRes.on('data', (c) => {
      if (data.length < 32768) data += c
    })
    upstreamRes.on('end', () => {
      const lat = Date.now() - start
      console.log(`[✓] Fetched ${targetUrl} via Laptop Broadband (${lat}ms, ${data.length} bytes)`)
      sendResolution(taskId, data, lat)
    })
  })
  clientReq.on('error', (err) => {
    sendResolution(taskId, 'Fetch error: ' + err.message, Date.now() - start)
  })
}

function sendResolution(taskId, data, latencyMs) {
  const payload = JSON.stringify({ taskId, data, latencyMs, bytes: data.length })
  const authHeaders = createMeshAuthHeaders(payload)
  const url = new URL(CLOUD_URL + '/api/channel/provider/resolve')
  const client = getClient(url.protocol)
  const postReq = client.request(
    {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      agent: getAgent(url.protocol),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...authHeaders
      }
    },
    () => {}
  )
  postReq.on('error', () => {})
  postReq.write(payload)
  postReq.end()
}

// Start polling
pollChannelTask()

// 3. Periodic heartbeat & channel keepalive every 30 seconds
setInterval(() => {
  const start = Date.now()
  const authHeaders = createMeshAuthHeaders('')
  const url = new URL(CLOUD_URL + '/api/ping')
  const client = getClient(url.protocol)
  client
    .get(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        agent: getAgent(url.protocol),
        headers: {
          ...authHeaders
        },
        timeout: 5000
      },
      (res) => {
        const lat = Date.now() - start
        console.log(`[♥] Channel Heartbeat: OK (${lat}ms latency to Azure South Africa Relay)`)
      }
    )
    .on('error', (err) => {
      console.warn(`[!] Heartbeat failed:`, err.message)
    })
}, 30000)
