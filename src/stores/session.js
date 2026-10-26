import { defineStore } from 'pinia'
import { api, setToken } from '../services/api'

export const useSession = defineStore('session', {
  state: () => ({ user: null, error: '', busy: false, token: localStorage.getItem('terjun_owner_token') || null }),
  actions: {
    async login(username, password) {
      this.busy = true
      this.error = ''
      try {
        const res = await api.post('/auth/login', { username, password })
        this._adopt(res)
        return true
      } catch (e) {
        this.error = e.message || 'Login gagal'
        return false
      } finally {
        this.busy = false
      }
    },
    _adopt(res) {
      setToken(res.access_token)
      this.token = res.access_token
      localStorage.setItem('terjun_owner_token', res.access_token)
      if (res.user) this.user = res.user
    },
    async tryPrototypeLogin() {
      try {
        const res = await api.post('/auth/prototype', {})
        this._adopt(res)
        return true
      } catch {
        return false
      }
    },
    boot() {
      if (this.token) setToken(this.token)
    },
    logout() {
      setToken(null)
      this.token = null
      localStorage.removeItem('terjun_owner_token')
      this.user = null
    },
  },
})
