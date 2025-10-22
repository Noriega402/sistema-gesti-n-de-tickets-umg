import React, { useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Jobs() {
  const [ticketId, setTicketId] = useState('')
  const [queue, setQueue] = useState('email')
  const [jobId, setJobId] = useState('')
  const [result, setResult] = useState(null)

  async function enqueue() {
    const { data } = await api.post('/jobs/enqueue/demo', { ticketId, type: queue })
    setJobId(data.jobId)
    setResult(null)
  }
  async function check() {
    if (!jobId) return
    const { data } = await api.get(`/jobs/${queue==='assign'?'assign':'send-email'}/${jobId}`)
    setResult(data)
  }

  return (
    <div style={{ maxWidth: 700, margin: '20px auto', fontFamily: 'system-ui' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Trabajos en cola</h2>
        <nav><Link to="/">Tickets</Link> | <a href="/queues" target="_blank">bull-board</a></nav>
      </header>
      <div>
        <label>ID de Ticket</label>{' '}
        <input value={ticketId} onChange={e=>setTicketId(e.target.value)} />
        <select value={queue} onChange={e=>setQueue(e.target.value)}>
          <option value="email">email</option>
          <option value="assign">assign</option>
        </select>
        <button onClick={enqueue}>Encolar</button>
        <br/>
        <label>Job ID</label>{' '}
        <input value={jobId} onChange={e=>setJobId(e.target.value)} />
        <button onClick={check}>Consultar</button>
        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  )
}
