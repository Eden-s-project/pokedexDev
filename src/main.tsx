import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-loading-skeleton/dist/skeleton.css'
import './index.css'
import { App } from './App'

// Criamos uma instância do QueryClient (ele gerenciará todo o cache de dados)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* BASE_URL vem do `base` do vite.config.ts ("/pokeApi/"). Com a barra final a lista
          vira /pokeApi/?tipo=fire; sem ela vira /pokeApi?tipo=fire, que dá 404 ao recarregar */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
