'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { userService } from '@/lib/firestore'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  photoURL?: string
}

interface AuthContextType {
  user: User | null
  login: () => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || undefined,
        }
        
        setUser(userData)
        
        // Guardar/actualizar usuario en Firestore
        try {
          await userService.createOrUpdate({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Usuario',
            photoURL: firebaseUser.photoURL || undefined,
          })
        } catch (error) {
          console.error('Error al guardar usuario en Firestore:', error)
        }
      } else {
        // Usuario no autenticado
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    try {
      setIsLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      toast.success(`¡Bienvenido, ${result.user.displayName}!`)
    } catch (error: any) {
      console.error('Error en login:', error)
      
      // Manejar errores específicos
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado')
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permite popups para este sitio.')
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error en logout:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
