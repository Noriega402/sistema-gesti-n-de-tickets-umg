import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import { Link } from 'react-router-dom'

function TicketForm() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('low')
  const create = useMutation({
    mutationFn: () => api.post('/tickets', { title, description, priority }),
    onSuccess: () => { qc.invalidateQueries(['tickets']); setTitle(''); setDescription(''); setPriority('low'); }
  })
  return (
    <form onSubmit={(e)=>{e.preventDefault(); create.mutate()}} style={{ marginBottom: 16 }}>
      <h3>Nuevo Ticket</h3>
      <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />{' '}
      <select value={priority} onChange={e=>setPriority(e.target.value)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select><br/>
      <textarea placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)} />
      <br/>
      <button>Crear (encola trabajos)</button>
    </form>
  )
}

export default function Dashboard() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['tickets'], queryFn: async ()=> (await api.get('/tickets')).data })
  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'system-ui' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Tickets</h2>
        <nav><Link to="/jobs">Trabajos (colas)</Link> | <a href="/queues" target="_blank">bull-board</a></nav>
      </header>
      <TicketForm />
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>ID</th><th>Título</th><th>Prioridad</th><th>Estado</th><th>Técnico</th></tr></thead>
        <tbody>
          {(data||[]).map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.status}</td>
              <td>{t.technician_name||'-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
