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
  PencilIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/AuthProvider'
import { fixedExpenseService, fixedExpensePaymentService } from '@/lib/firestore'
import { FixedExpense, FixedExpensePayment } from '@/types'
import { EditFixedExpenseForm } from './EditFixedExpenseForm'
import { PayFixedExpenseModal } from './PayFixedExpenseModal'
import toast from 'react-hot-toast'

interface FixedExpenseListProps {
  refreshKey?: number
  onAddClick: () => void
}

export function FixedExpenseList({ refreshKey, onAddClick }: FixedExpenseListProps) {
  const { user } = useAuth()
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [monthlyPayments, setMonthlyPayments] = useState<FixedExpensePayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [payingExpense, setPayingExpense] = useState<FixedExpense | null>(null)
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    const loadFixedExpensesAndPayments = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        
        // Cargar gastos fijos
        const expenses = await fixedExpenseService.getByUser(user.id)
        setFixedExpenses(expenses)
        
        // Cargar pagos del mes actual
        const payments = await fixedExpensePaymentService.getByUserAndMonth(
          user.id, 
          currentMonth, 
          currentYear
        )
        setMonthlyPayments(payments)
        
      } catch (error) {
        console.error('Error al cargar gastos fijos:', error)
        toast.error('Error al cargar gastos fijos')
      } finally {
        setIsLoading(false)
      }
    }

    loadFixedExpensesAndPayments()
  }, [user, refreshKey, currentMonth, currentYear])

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

  const handlePaymentUpdated = async () => {
    // Recargar los pagos del mes actual
    if (user) {
      const payments = await fixedExpensePaymentService.getByUserAndMonth(
        user.id, 
        currentMonth, 
        currentYear
      )
      setMonthlyPayments(payments)
    }
  }

  const getPaymentForExpense = (expenseId: string): FixedExpensePayment | undefined => {
    return monthlyPayments.find(payment => payment.fixedExpenseId === expenseId)
  }

  const handleMarkAsPending = async (expense: FixedExpense) => {
    if (!user) return
    
    try {
      await fixedExpensePaymentService.markAsPending(
        expense.id,
        user.id,
        currentMonth,
        currentYear
      )
      await handlePaymentUpdated()
      toast.success('Gasto marcado como pendiente')
    } catch (error) {
      console.error('Error al marcar como pendiente:', error)
      toast.error('Error al actualizar el estado')
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
                    {(() => {
                      const payment = getPaymentForExpense(expense.id)
                      if (payment) {
                        return (
                          <>
                            <p className={`text-lg font-bold ${expense.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                              ${payment.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-green-600 font-medium">✓ Pagado</p>
                          </>
                        )
                      } else {
                        return (
                          <>
                            <p className="text-lg font-bold text-orange-600">Pendiente</p>
                            <p className="text-xs text-gray-500">Sin pagar</p>
                          </>
                        )
                      }
                    })()}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const payment = getPaymentForExpense(expense.id)
                      if (payment) {
                        return (
                          <button
                            onClick={() => handleMarkAsPending(expense)}
                            className="p-2 hover:bg-orange-50 rounded-full transition-colors btn-touch"
                            title="Marcar como pendiente"
                          >
                            <ClockIcon className="h-4 w-4 text-orange-600" />
                          </button>
                        )
                      } else {
                        return (
                          <button
                            onClick={() => setPayingExpense(expense)}
                            className="p-2 hover:bg-green-50 rounded-full transition-colors btn-touch"
                            title="Marcar como pagado"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </button>
                        )
                      }
                    })()}
                    
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
            <span className="text-primary-700 font-medium">Total pagado este mes:</span>
            <span className="text-xl font-bold text-primary-900">
              ${monthlyPayments
                .filter(payment => payment.isPagado)
                .reduce((sum, payment) => sum + payment.monto, 0)
                .toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-primary-600">Gastos pagados:</span>
            <span className="text-sm font-medium text-primary-700">
              {monthlyPayments.filter(payment => payment.isPagado).length} de {fixedExpenses.filter(expense => expense.isActive).length}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-orange-600">Pendientes:</span>
            <span className="text-sm font-medium text-orange-700">
              {fixedExpenses.filter(expense => expense.isActive).length - monthlyPayments.filter(payment => payment.isPagado).length}
            </span>
          </div>
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

      {/* Modal de pago */}
      {payingExpense && (
        <PayFixedExpenseModal
          expense={payingExpense}
          mes={currentMonth}
          año={currentYear}
          onClose={() => setPayingExpense(null)}
          onPaymentUpdated={handlePaymentUpdated}
        />
      )}
    </div>
  )
}
