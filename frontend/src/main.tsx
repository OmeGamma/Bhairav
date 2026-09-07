import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

type Theme = 'dark' | 'light' | 'system'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

const savedTheme = localStorage.getItem('bhairav-theme') as Theme | null
if (savedTheme) {
  applyTheme(savedTheme)
} else {
  applyTheme('system')
}

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', () => {
  const current = (localStorage.getItem('bhairav-theme') as Theme | null) || 'system'
  if (current === 'system') {
    applyTheme('system')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

