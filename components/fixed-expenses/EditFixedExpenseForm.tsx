'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { fixedExpenseService } from '@/lib/firestore'
import { FixedExpense } from '@/types'

interface EditFixedExpenseFormProps {
  expense: FixedExpense
  onClose: () => void
  onExpenseUpdated?: () => void
  onExpenseDeleted?: () => void
}

export function EditFixedExpenseForm({ expense, onClose, onExpenseUpdated, onExpenseDeleted }: EditFixedExpenseFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: expense.descripcion,
    categoria: expense.categoria,
    fechaVencimiento: expense.fechaVencimiento,
    isActive: expense.isActive,
  })

  const categorias = [
    { id: 'hogar', nombre: 'Hogar', color: 'bg-yellow-100 text-yellow-800', emoji: '🏠' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800', emoji: '🚗' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800', emoji: '🎬' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800', emoji: '⚕️' },
    { id: 'educacion', nombre: 'Educación', color: 'bg-indigo-100 text-indigo-800', emoji: '📚' },
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800', emoji: '🍽️' },
    { id: 'finanzas', nombre: 'Finanzas', color: 'bg-emerald-100 text-emerald-800', emoji: '💳' },
    { id: 'otros', nombre: 'Otros', color: 'bg-gray-100 text-gray-800', emoji: '📦' },
  ]

  // Días del mes para vencimiento
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descripcion || !formData.categoria) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (!user) {
      toast.error('Debes estar autenticado para editar gastos fijos')
      return
    }

    setIsSubmitting(true)

    try {
      await fixedExpenseService.update(expense.id, {
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        fechaVencimiento: formData.fechaVencimiento,
        isActive: formData.isActive,
      })

      toast.success('Gasto fijo actualizado correctamente')
      onExpenseUpdated?.()
      onClose()
    } catch (error) {
      console.error('Error al actualizar gasto fijo:', error)
      toast.error('Error al actualizar el gasto fijo. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para eliminar gastos fijos')
      return
    }

    setIsDeleting(true)

    try {
      await fixedExpenseService.delete(expense.id)
      toast.success('Gasto fijo eliminado correctamente')
      onExpenseDeleted?.()
      onClose()
    } catch (error) {
      console.error('Error al eliminar gasto fijo:', error)
      toast.error('Error al eliminar el gasto fijo. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fechaVencimiento' ? parseInt(value) || 1 : value
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
              <h2 className="text-xl font-bold text-gray-900">Editar Gasto Fijo</h2>
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
                ¿Eliminar este gasto fijo?
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
              {/* Estado activo/inactivo */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Gasto activo
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

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
                  placeholder="Ej: Alquiler, Internet, etc."
                />
              </div>

              {/* Día de vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Día de vencimiento
                </label>
                <select
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {daysOfMonth.map(day => (
                    <option key={day} value={day}>
                      Día {day}
                    </option>
                  ))}
                </select>
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
                      <div className="text-2xl mb-1">{categoria.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">{categoria.nombre}</div>
                      {formData.categoria === categoria.id && (
                        <motion.div
                          layoutId="selected-fixed-category"
                          className="absolute inset-0 border-2 border-primary-500 rounded-lg bg-primary-50"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
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
