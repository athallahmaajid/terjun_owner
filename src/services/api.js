const BASE = 'https://terjun-backend.fastapicloud.dev/api'
let token = null
const unauthorizedHandlers = []

export function setToken(t) {
  token = t
}

export function getToken() {
  return token
}

export function onUnauthorized(fn) {
  unauthorizedHandlers.push(fn)
}

export function apiUrl(path) {
  return `${BASE}${path}`
}

export function isTauri() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function request(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401 && path !== '/auth/login') {
      token = null
      unauthorizedHandlers.forEach((fn) => fn())
    }
    throw new Error(body.detail || res.statusText)
  }
  return res.json()
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (p, body) => request(p, { method: 'PATCH', body: JSON.stringify(body) }),
}

export function csvUrl(path) {
  return `${apiUrl(path)}${path.includes('?') ? '&' : '?'}format=csv&token=${token || ''}`
}

export async function openExternal(url) {
  if (isTauri()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(url)
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
