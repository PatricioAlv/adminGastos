'use client'

import { BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import Image from 'next/image'

export function Header() {
  const { user, logout } = useAuth()
  const currentMonth = new Date().toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AhorrApp</h1>
            <p className="text-sm text-gray-600 capitalize">{currentMonth}</p>
            {user && (
              <p className="text-xs text-primary-600">¡Hola, {user.name}!</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 btn-touch"
              title="Notificaciones"
            >
              <BellIcon className="h-6 w-6" />
            </motion.button>
            
            {/* Avatar del usuario */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                  unoptimized // Para imágenes de Google
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
              )}
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 btn-touch"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}
