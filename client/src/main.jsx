import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import {AppProvider} from './context/AppContext.jsx'
import {MotionConfig} from 'motion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/react-query.js'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MotionConfig viewport={{once: true}}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </MotionConfig>
      </AppProvider>
    </QueryClientProvider>
  </BrowserRouter>,
)
