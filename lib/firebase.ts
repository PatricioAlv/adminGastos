import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Verificar si todas las variables de entorno están disponibles
const isConfigComplete = Object.values(firebaseConfig).every(value => value !== undefined)

// Inicializar Firebase solo si la configuración está completa
let app: any = null
if (isConfigComplete) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

// Inicializar servicios solo si la app está disponible
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Inicializar Analytics (solo en el browser y si está soportado)
export const analytics = typeof window !== 'undefined' && app ? 
  isSupported().then(yes => yes ? getAnalytics(app) : null) : null

// Configurar el proveedor de Google
export const googleProvider = app ? new GoogleAuthProvider() : null
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  })
}

export default app
