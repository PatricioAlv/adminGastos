'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { fixedExpensePaymentService } from '@/lib/firestore'
import { FixedExpense } from '@/types'

interface PayFixedExpenseModalProps {
  expense: FixedExpense
  mes: number
  año: number
  onClose: () => void
  onPaymentUpdated: () => void
}

export function PayFixedExpenseModal({ 
  expense, 
  mes, 
  año, 
  onClose, 
  onPaymentUpdated 
}: PayFixedExpenseModalProps) {
  const { user } = useAuth()
  const [monto, setMonto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('Por favor ingresa un monto válido')
      return
    }

    if (!user) {
      toast.error('Debes estar autenticado')
      return
    }

    setIsSubmitting(true)

    try {
      const fechaPago = new Date().toISOString().split('T')[0]
      
      await fixedExpensePaymentService.markAsPaid(
        expense.id,
        user.id,
        mes,
        año,
        parseFloat(monto),
        fechaPago
      )

      toast.success('Gasto marcado como pagado')
      onPaymentUpdated()
      onClose()
    } catch (error) {
      console.error('Error al marcar como pagado:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Marcar como Pagado</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Información del gasto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{expense.descripcion}</h3>
            <p className="text-sm text-gray-600">{mesNombres[mes - 1]} {año}</p>
            <p className="text-xs text-gray-500">Vence el día {expense.fechaVencimiento}</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
                Monto Pagado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el monto real que pagaste este mes
              </p>
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Marcar como Pagado
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
