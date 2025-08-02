'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  CalendarIcon, 
  CreditCardIcon,
  TrashIcon,
  EyeSlashIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/AuthProvider'
import { fixedExpenseService } from '@/lib/firestore'
import { FixedExpense } from '@/types'
import { EditFixedExpenseForm } from './EditFixedExpenseForm'
import toast from 'react-hot-toast'

interface FixedExpenseListProps {
  refreshKey?: number
  onAddClick: () => void
}

export function FixedExpenseList({ refreshKey, onAddClick }: FixedExpenseListProps) {
  const { user } = useAuth()
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)

  useEffect(() => {
    const loadFixedExpenses = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const expenses = await fixedExpenseService.getByUser(user.id)
        setFixedExpenses(expenses)
      } catch (error) {
        console.error('Error al cargar gastos fijos:', error)
        toast.error('Error al cargar gastos fijos')
      } finally {
        setIsLoading(false)
      }
    }

    loadFixedExpenses()
  }, [user, refreshKey])

  const handleExpenseUpdated = () => {
    // Recargar la lista de gastos fijos
    if (user) {
      fixedExpenseService.getByUser(user.id).then(setFixedExpenses)
    }
  }

  const handleExpenseDeleted = () => {
    // Recargar la lista de gastos fijos
    if (user) {
      fixedExpenseService.getByUser(user.id).then(setFixedExpenses)
    }
  }

  const handleToggleActive = async (expense: FixedExpense) => {
    try {
      await fixedExpenseService.update(expense.id, {
        isActive: !expense.isActive
      })
      
      // Actualizar estado local
      setFixedExpenses(prev => 
        prev.map(exp => 
          exp.id === expense.id 
            ? { ...exp, isActive: !exp.isActive }
            : exp
        )
      )
      
      toast.success(expense.isActive ? 'Gasto pausado' : 'Gasto activado')
    } catch (error) {
      console.error('Error al actualizar gasto fijo:', error)
      toast.error('Error al actualizar el gasto')
    }
  }

  const handleDelete = async (expense: FixedExpense) => {
    if (!confirm(`¿Eliminar "${expense.descripcion}"?`)) return
    
    try {
      await fixedExpenseService.delete(expense.id)
      setFixedExpenses(prev => prev.filter(exp => exp.id !== expense.id))
      toast.success('Gasto fijo eliminado')
    } catch (error) {
      console.error('Error al eliminar gasto fijo:', error)
      toast.error('Error al eliminar el gasto')
    }
  }

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

  const getNextDueDate = (dayOfMonth: number) => {
    const today = new Date()
    const nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth)
    
    if (nextDate < today) {
      nextDate.setMonth(nextDate.getMonth() + 1)
    }
    
    return nextDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="bg-gray-300 rounded h-8 w-32 animate-pulse"></div>
          <div className="bg-gray-300 rounded h-10 w-24 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-300 rounded-xl h-20 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gastos Fijos</h2>
          <p className="text-gray-600">Gestiona tus gastos recurrentes</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg btn-touch flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Agregar</span>
        </motion.button>
      </div>

      {/* Lista de gastos fijos */}
      {fixedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay gastos fijos
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega gastos recurrentes como alquiler, servicios o suscripciones
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg btn-touch"
          >
            Agregar Primer Gasto Fijo
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {fixedExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-4 shadow-sm border ${
                expense.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{categoryEmojis[expense.categoria] || '📦'}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${expense.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {expense.descripcion}
                      </h3>
                      {!expense.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Pausado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Día {expense.fechaVencimiento} - Próximo: {getNextDueDate(expense.fechaVencimiento)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categoryColors[expense.categoria] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {categoryNames[expense.categoria] || 'Otros'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${expense.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      ${expense.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">por mes</p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors btn-touch"
                      title="Editar gasto"
                    >
                      <PencilIcon className="h-4 w-4 text-blue-600" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(expense)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors btn-touch"
                      title={expense.isActive ? 'Pausar gasto' : 'Activar gasto'}
                    >
                      {expense.isActive ? (
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(expense)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors btn-touch"
                      title="Eliminar gasto"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {fixedExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 rounded-xl p-4 border border-primary-200"
        >
          <div className="flex justify-between items-center">
            <span className="text-primary-700 font-medium">Total mensual:</span>
            <span className="text-xl font-bold text-primary-900">
              ${fixedExpenses
                .filter(expense => expense.isActive)
                .reduce((sum, expense) => sum + expense.monto, 0)
                .toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-sm text-primary-600 mt-1">
            {fixedExpenses.filter(expense => expense.isActive).length} gastos activos
          </p>
        </motion.div>
      )}

      {/* Modal de edición */}
      {editingExpense && (
        <EditFixedExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onExpenseUpdated={handleExpenseUpdated}
          onExpenseDeleted={handleExpenseDeleted}
        />
      )}
    </div>
  )
}
