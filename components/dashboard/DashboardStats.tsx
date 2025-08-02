'use client'

import { useState, useEffect } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { expenseService, fixedExpenseService, userSettingsService } from '@/lib/firestore'
import { LocalExpense, FixedExpense, UserSettings } from '@/types'

export function DashboardStats({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<LocalExpense[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Usar el presupuesto de la configuración del usuario, con fallback a valor por defecto
  const presupuestoMensual = userSettings?.monthlyBudget || 50000

  useEffect(() => {
    const loadExpenses = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        
        // Cargar configuración del usuario
        const settings = await userSettingsService.getOrCreateDefault(user.id)
        setUserSettings(settings)
        
        // Cargar gastos variables
        const allExpenses = await expenseService.getByUser(user.id, 100)
        
        // Filtrar por mes actual en el cliente
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        const currentMonthExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.fecha)
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear
        })
        
        setExpenses(currentMonthExpenses)

        // Cargar gastos fijos
        const activeFixedExpenses = await fixedExpenseService.getByUser(user.id)
        setFixedExpenses(activeFixedExpenses.filter(expense => expense.isActive))
      } catch (error) {
        console.error('Error al cargar gastos del dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
  }, [user, refreshKey])

  // Calcular estadísticas
  const gastosEsteMes = expenses.reduce((total, expense) => total + expense.monto, 0)
  const gastosFijos = fixedExpenses.reduce((total, expense) => total + expense.monto, 0)
  const gastosTotales = gastosEsteMes + gastosFijos
  const porcentajeGastado = (gastosTotales / presupuestoMensual) * 100
  const disponible = presupuestoMensual - gastosTotales

  // Obtener gastos recientes (últimos 3)
  const gastosRecientes = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Mapear categorías a emojis
  const categoryEmojis: { [key: string]: string } = {
    'alimentacion': '🍽️',
    'transporte': '🚗',
    'entretenimiento': '🎬',
    'salud': '⚕️',
    'educacion': '📚',
    'hogar': '🏠',
    'ropa': '👕',
    'otros': '📦',
  }

  const categoryColors: { [key: string]: string } = {
    'alimentacion': 'bg-green-100 text-green-800',
    'transporte': 'bg-blue-100 text-blue-800',
    'entretenimiento': 'bg-purple-100 text-purple-800',
    'salud': 'bg-red-100 text-red-800',
    'educacion': 'bg-indigo-100 text-indigo-800',
    'hogar': 'bg-yellow-100 text-yellow-800',
    'ropa': 'bg-pink-100 text-pink-800',
    'otros': 'bg-gray-100 text-gray-800',
  }

  const categoryNames: { [key: string]: string } = {
    'alimentacion': 'Alimentación',
    'transporte': 'Transporte',
    'entretenimiento': 'Entretenimiento',
    'salud': 'Salud',
    'educacion': 'Educación',
    'hogar': 'Hogar',
    'ropa': 'Ropa',
    'otros': 'Otros',
  }

  const formatRelativeDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      const diffTime = Math.abs(today.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `Hace ${diffDays} días`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gray-300 rounded-2xl h-32"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-300 rounded-xl h-20"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
      >
        <h2 className="text-lg font-semibold mb-2">Resumen del mes</h2>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold">${gastosTotales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            <p className="text-primary-100 text-sm">de ${presupuestoMensual.toLocaleString('es-ES')} presupuestado</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{porcentajeGastado.toFixed(0)}%</div>
            <div className="text-xs text-primary-100">usado</div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4 bg-primary-400 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`rounded-full h-2 ${
              porcentajeGastado > 90 ? 'bg-red-300' : 
              porcentajeGastado > 75 ? 'bg-yellow-300' : 'bg-white'
            }`}
          />
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-success-500" />
            <span className="text-xs text-gray-500">Este mes</span>
          </div>
          <p className="text-xl font-bold text-gray-900">${gastosEsteMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-600">Gastos variables</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <CreditCardIcon className="h-5 w-5 text-warning-500" />
            <span className="text-xs text-gray-500">Mensuales</span>
          </div>
          <p className="text-xl font-bold text-gray-900">${gastosFijos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-600">Gastos fijos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="h-5 w-5 text-primary-500" />
            <span className="text-xs text-gray-500">Restante</span>
          </div>
          <p className={`text-xl font-bold ${disponible >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            ${disponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600">Disponible</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingDownIcon className="h-5 w-5 text-danger-500" />
            <span className="text-xs text-gray-500">Gastos</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{expenses.length}</p>
          <p className="text-sm text-gray-600">Este mes</p>
        </motion.div>
      </div>

      {/* Gastos recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos recientes</h3>
        {gastosRecientes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-500">No hay gastos este mes</p>
            <p className="text-sm text-gray-400">¡Comienza agregando tu primer gasto!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gastosRecientes.map((gasto) => (
              <div key={gasto.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{categoryEmojis[gasto.categoria] || '📦'}</div>
                  <div>
                    <div className="font-medium text-gray-900">{gasto.descripcion}</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[gasto.categoria] || 'bg-gray-100 text-gray-800'}`}>
                        {categoryNames[gasto.categoria] || 'Otros'}
                      </span>
                      <span className="text-gray-500">{formatRelativeDate(gasto.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">${gasto.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
