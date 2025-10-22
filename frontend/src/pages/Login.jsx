import React, { useState } from 'react'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      window.location.href = '/'
    } catch (e) {
      setError(e?.response?.data?.error || 'Error')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Contraseña</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button style={{ marginTop: 12 }}>Entrar</button>
      </form>
    </div>
  )
}
