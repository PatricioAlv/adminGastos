'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useState } from 'react'

export default function AuthPage() {
  const { login, isLoading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await login()
    } catch (error) {
      console.error('Error en sign in:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            💰
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">AdminGastos</h1>
          <p className="text-primary-100 text-lg mb-2">
            Control inteligente de gastos
          </p>
          <p className="text-primary-200 text-sm">
            Gestiona tu dinero de forma fácil y segura
          </p>
        </div>

        {/* Tarjeta de login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido!
            </h2>
            <p className="text-gray-600">
              Inicia sesión con tu cuenta de Google para continuar
            </p>
          </div>

          {/* Botón de Google Sign-In */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading || isSigningIn}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3 font-semibold btn-touch disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </motion.button>

          {/* Información adicional */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="mb-2">Al continuar, aceptas nuestros</p>
            <div className="space-x-1">
              <a href="#" className="text-primary-600 hover:underline">Términos de Servicio</a>
              <span>y</span>
              <a href="#" className="text-primary-600 hover:underline">Política de Privacidad</a>
            </div>
          </div>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 gap-4 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">Mobile First</h3>
            <p className="text-sm text-primary-100">Diseñado para tu smartphone</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="text-xl mb-1">🔒</div>
              <h4 className="font-medium text-sm mb-1">Seguro</h4>
              <p className="text-xs text-primary-100">Datos protegidos</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="text-xl mb-1">📊</div>
              <h4 className="font-medium text-sm mb-1">Inteligente</h4>
              <p className="text-xs text-primary-100">Análisis automático</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
