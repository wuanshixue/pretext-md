import { useEffect } from 'react'
import { Reader } from './components/Reader/Reader'
import { useSettingsStore } from './stores/settings'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <Reader />
}
