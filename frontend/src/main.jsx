import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Jobs from './pages/Jobs.jsx'

const qc = new QueryClient()

function RequireAuth({ children }) {
  const token = localStorage.getItem('access')
  return token ? children : <Navigate to="/login" />
}

const router = createBrowserRouter([
  { path: '/', element: <RequireAuth><Dashboard/></RequireAuth> },
  { path: '/jobs', element: <RequireAuth><Jobs/></RequireAuth> },
  { path: '/login', element: <Login/> }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
