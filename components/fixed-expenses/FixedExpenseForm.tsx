'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { fixedExpenseService } from '@/lib/firestore'

interface FixedExpenseFormProps {
  onClose: () => void
  onExpenseAdded?: () => void
}

export function FixedExpenseForm({ onClose, onExpenseAdded }: FixedExpenseFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: '',
    categoria: '',
    fechaVencimiento: 1,
  })

  const categorias = [
    { id: 'hogar', nombre: 'Hogar', color: 'bg-yellow-100 text-yellow-800', emoji: '🏠' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800', emoji: '🚗' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800', emoji: '🎬' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800', emoji: '⚕️' },
    { id: 'educacion', nombre: 'Educación', color: 'bg-indigo-100 text-indigo-800', emoji: '📚' },
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800', emoji: '🍽️' },
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
      toast.error('Debes estar autenticado para agregar gastos fijos')
      return
    }

    setIsSubmitting(true)

    try {
      await fixedExpenseService.create({
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        fechaVencimiento: formData.fechaVencimiento,
        isActive: true,
        userId: user.id,
      })

      toast.success('Gasto fijo agregado correctamente')
      onExpenseAdded?.()
      onClose()
    } catch (error) {
      console.error('Error al agregar gasto fijo:', error)
      toast.error('Error al agregar el gasto fijo. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
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
            <h2 className="text-xl font-bold text-gray-900">Nuevo Gasto Fijo</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors btn-touch disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="ej. Internet Movistar, Alquiler, Netflix..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Día de vencimiento
              </label>
              <select
                id="fechaVencimiento"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                disabled={isSubmitting}
              >
                {daysOfMonth.map(day => (
                  <option key={day} value={day}>
                    Día {day}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Día del mes en que se debe pagar este gasto
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categoría
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categorias.map((categoria) => (
                  <label
                    key={categoria.id}
                    className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all btn-touch ${
                      formData.categoria === categoria.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoria"
                      value={categoria.id}
                      checked={formData.categoria === categoria.id}
                      onChange={handleInputChange}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{categoria.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {categoria.nombre}
                      </span>
                    </div>
                    {formData.categoria === categoria.id && (
                      <motion.div
                        layoutId="selected-category"
                        className="absolute inset-0 border-2 border-primary-500 rounded-lg bg-primary-50"
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Botón submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium btn-touch disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Agregar Gasto Fijo</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
