'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { FixedExpenseList } from '@/components/fixed-expenses/FixedExpenseList'
import { FixedExpenseForm } from '@/components/fixed-expenses/FixedExpenseForm'

// Forzar renderizado dinámico para evitar problemas con Firebase en build
export const dynamic = 'force-dynamic'
import { Settings } from '@/components/settings/Settings'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/components/providers/AuthProvider'
import AuthPage from '@/app/auth/page'

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showFixedExpenseForm, setShowFixedExpenseForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1) // Forzar refresh de componentes
  }

  const handleFixedExpenseAdded = () => {
    setRefreshKey(prev => prev + 1) // Forzar refresh de componentes
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardStats refreshKey={refreshKey} />
            
            {/* Botón flotante para agregar gasto */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpenseForm(true)}
              className="fixed bottom-24 right-4 bg-primary-500 text-white p-4 rounded-full shadow-lg btn-touch z-10"
            >
              <PlusIcon className="h-6 w-6" />
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ExpenseList refreshKey={refreshKey} />
          </motion.div>
        )}

        {activeTab === 'fixed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FixedExpenseList 
              refreshKey={refreshKey}
              onAddClick={() => setShowFixedExpenseForm(true)}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Header de configuración */}
              <div className="text-center">
                <Cog6ToothIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Configuración
                </h2>
                <p className="text-gray-600">
                  Personaliza tu experiencia de gestión de gastos
                </p>
              </div>

              {/* Botones de configuración */}
              <div className="space-y-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-gray-900">Presupuesto y Configuración</h3>
                      <p className="text-sm text-gray-600">
                        Establece tu presupuesto mensual y personaliza la app
                      </p>
                    </div>
                    <div className="text-gray-400">
                      →
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-gray-900">Reportes Avanzados</h3>
                      <p className="text-sm text-gray-600">
                        Análisis detallado de tus gastos (Próximamente)
                      </p>
                    </div>
                    <div className="text-gray-400">
                      →
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Formulario modal para agregar gastos */}
      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => setShowExpenseForm(false)} 
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {/* Formulario modal para agregar gastos fijos */}
      {showFixedExpenseForm && (
        <FixedExpenseForm 
          onClose={() => setShowFixedExpenseForm(false)} 
          onExpenseAdded={handleFixedExpenseAdded}
        />
      )}

      {/* Modal de configuración */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <div className="animate-pulse text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <MainApp />
}
