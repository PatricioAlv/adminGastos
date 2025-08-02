'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/components/providers/AuthProvider'
import AuthPage from '@/app/auth/page'

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExpenseAdded = () => {
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
            <DashboardStats key={`dashboard-${refreshKey}`} />
            
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
            <ExpenseList key={`expenses-${refreshKey}`} />
          </motion.div>
        )}

        {activeTab === 'fixed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gastos Fijos
              </h3>
              <p className="text-gray-600 mb-6">
                Gestiona tus gastos recurrentes como servicios, suscripciones y facturas
              </p>
              <button className="bg-primary-500 text-white px-6 py-3 rounded-lg btn-touch">
                Agregar Gasto Fijo
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <Cog6ToothIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración
              </h3>
              <p className="text-gray-600">
                Personaliza tu experiencia y configuraciones de la cuenta
              </p>
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
