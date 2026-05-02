export type TaskType = 'assignment' | 'exam' | 'quiz' | 'lab' | 'project'
export type Urgency  = 'overdue' | 'urgent' | 'soon' | 'ok' | 'done'

export interface Task {
  id:       string
  title:    string
  subject:  string
  type:     TaskType
  deadline: string
  marks:    number
  notes:    string
  done:     boolean
  created:  string
}

export interface User {
  name:     string
  semester: string
  college:  string
}

export type Page = 'dashboard' | 'calendar' | 'analytics' | 'streaks' | 'notes' | 'reminders' | 'timer' | 'settings'
