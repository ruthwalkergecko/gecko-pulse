'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('gecko-theme') || 'dark'
    setTheme(saved)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('gecko-theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center w-7 h-7 rounded-lg border border-gecko-border text-gecko-muted hover:text-white hover:border-gecko-muted transition-colors"
    >
      {theme === 'dark'
        ? <Sun size={13} />
        : <Moon size={13} />
      }
    </button>
  )
}
