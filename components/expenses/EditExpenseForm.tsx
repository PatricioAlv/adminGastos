'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { expenseService } from '@/lib/firestore'
import { LocalExpense } from '@/types'

interface EditExpenseFormProps {
  expense: LocalExpense
  onClose: () => void
  onExpenseUpdated?: () => void
  onExpenseDeleted?: () => void
}

export function EditExpenseForm({ expense, onClose, onExpenseUpdated, onExpenseDeleted }: EditExpenseFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: expense.descripcion,
    monto: expense.monto.toString(),
    categoria: expense.categoria,
    fecha: expense.fecha, // YYYY-MM-DD format
  })

  const categorias = [
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800', emoji: '🍽️' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800', emoji: '🚗' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800', emoji: '🎬' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800', emoji: '⚕️' },
    { id: 'educacion', nombre: 'Educación', color: 'bg-indigo-100 text-indigo-800', emoji: '📚' },
    { id: 'hogar', nombre: 'Hogar', color: 'bg-yellow-100 text-yellow-800', emoji: '🏠' },
    { id: 'ropa', nombre: 'Ropa', color: 'bg-pink-100 text-pink-800', emoji: '👕' },
    { id: 'finanzas', nombre: 'Finanzas', color: 'bg-emerald-100 text-emerald-800', emoji: '💳' },
    { id: 'otros', nombre: 'Otros', color: 'bg-gray-100 text-gray-800', emoji: '📦' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descripcion || !formData.monto || !formData.categoria || !formData.fecha) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (!user) {
      toast.error('Debes estar autenticado para editar gastos')
      return
    }

    const monto = parseFloat(formData.monto)
    if (isNaN(monto) || monto <= 0) {
      toast.error('El monto debe ser un número válido mayor a 0')
      return
    }

    setIsSubmitting(true)

    try {
      await expenseService.update(expense.id, {
        descripcion: formData.descripcion.trim(),
        monto: monto,
        categoria: formData.categoria,
        fecha: formData.fecha,
      })

      toast.success('Gasto actualizado correctamente')
      onExpenseUpdated?.()
      onClose()
    } catch (error) {
      console.error('Error al actualizar gasto:', error)
      toast.error('Error al actualizar el gasto. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para eliminar gastos')
      return
    }

    setIsDeleting(true)

    try {
      await expenseService.delete(expense.id)
      toast.success('Gasto eliminado correctamente')
      onExpenseDeleted?.()
      onClose()
    } catch (error) {
      console.error('Error al eliminar gasto:', error)
      toast.error('Error al eliminar el gasto. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <PencilIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Editar Gasto</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {showDeleteConfirm ? (
            /* Confirmación de eliminación */
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar este gasto?
              </h3>
              <p className="text-gray-600 mb-6">
                Esta acción no se puede deshacer
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de edición */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Almuerzo, Gasolina, etc."
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categorias.map((categoria) => (
                    <motion.button
                      key={categoria.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.id }))}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        formData.categoria === categoria.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative z-10">
                        <div className="text-2xl mb-1">{categoria.emoji}</div>
                        <div className="text-xs font-medium text-gray-700">{categoria.nombre}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
