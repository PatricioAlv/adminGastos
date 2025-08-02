import { Timestamp } from 'firebase/firestore'

export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Expense {
  id: string
  descripcion: string
  monto: number
  categoria: string
  fecha: string // YYYY-MM-DD format
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
}

export interface Category {
  id: string
  nombre: string
  color: string
  emoji: string
  isActive: boolean
  isDefault: boolean // Para categorías predeterminadas del sistema
}

export interface FixedExpense {
  id: string
  descripcion: string
  monto: number
  categoria: string
  fechaVencimiento: number // día del mes (1-31)
  isActive: boolean
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Budget {
  id: string
  mes: number // 1-12
  año: number
  limite: number
  gastado: number
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Tipos para la aplicación local
export interface LocalExpense {
  id: string
  descripcion: string
  monto: number
  categoria: string
  fecha: string
  createdAt: Date
  updatedAt: Date
  userId: string
}
