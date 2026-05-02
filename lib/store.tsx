'use client'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Task, User } from './types'
import { supabase } from './supabase'

interface StoreCtx {
  tasks:      Task[]
  user:       User
  authUser:   { id: string; email: string } | null
  loading:    boolean
  setTasks:   (fn: Task[] | ((prev: Task[]) => Task[])) => void
  setUser:    (u: User) => Promise<void>
  addTask:    (t: Task) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  signOut:    () => Promise<void>
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks,    setTasksRaw] = useState<Task[]>([])
  const [user,     setUserRaw]  = useState<User>({ name: '', semester: '', college: '' })
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email ?? '' })
      } else {
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email ?? '' })
      } else {
        setAuthUser(null)
        setTasksRaw([])
        setUserRaw({ name: '', semester: '', college: '' })
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authUser) return
    const load = async () => {
      setLoading(true)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      if (profile) setUserRaw({ name: profile.name || '', semester: profile.semester || '', college: profile.college || '' })
      const { data: dbTasks } = await supabase.from('tasks').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
      if (dbTasks) setTasksRaw(dbTasks.map(t => ({ id: t.id, title: t.title, subject: t.subject || '', type: t.type, deadline: t.deadline, marks: t.marks || 0, notes: t.notes || '', done: t.done, created: t.created_at })))
      setLoading(false)
    }
    load()
  }, [authUser])

  const setTasks = useCallback((fn: Task[] | ((p: Task[]) => Task[])) => {
    setTasksRaw(prev => typeof fn === 'function' ? fn(prev) : fn)
  }, [])

  const addTask = useCallback(async (t: Task) => {
    if (!authUser) return
    setTasksRaw(prev => [t, ...prev])
    await supabase.from('tasks').insert({ id: t.id, user_id: authUser.id, title: t.title, subject: t.subject, type: t.type, deadline: t.deadline, marks: t.marks, notes: t.notes, done: t.done, created_at: t.created })
  }, [authUser])

  const toggleTask = useCallback(async (id: string) => {
    let newDone = false
    setTasksRaw(prev => prev.map(t => { if (t.id === id) { newDone = !t.done; return { ...t, done: newDone } } return t }))
    await supabase.from('tasks').update({ done: newDone }).eq('id', id)
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    setTasksRaw(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }, [])

  const setUser = useCallback(async (u: User) => {
    setUserRaw(u)
    if (!authUser) return
    await supabase.from('profiles').upsert({ id: authUser.id, name: u.name, semester: u.semester, college: u.college })
  }, [authUser])

  const signOut = useCallback(async () => { await supabase.auth.signOut() }, [])

  return (
    <Ctx.Provider value={{ tasks, user, authUser, loading, setTasks, setUser, addTask, toggleTask, deleteTask, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
