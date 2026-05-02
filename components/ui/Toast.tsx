'use client'
import { useEffect, useState } from 'react'

export default function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 200) }, 2400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg transition-all duration-200"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)` }}
    >
      {msg}
    </div>
  )
}
