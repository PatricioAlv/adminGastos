'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { expenseService } from '@/lib/firestore'

interface ExpenseFormProps {
  onClose: () => void
  onExpenseAdded?: () => void
}

export function ExpenseForm({ onClose, onExpenseAdded }: ExpenseFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    categoria: '',
    fecha: new Date().toISOString().split('T')[0],
  })

  const categorias = [
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800', emoji: '🍽️' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800', emoji: '🚗' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800', emoji: '🎬' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800', emoji: '⚕️' },
    { id: 'educacion', nombre: 'Educación', color: 'bg-indigo-100 text-indigo-800', emoji: '📚' },
    { id: 'hogar', nombre: 'Hogar', color: 'bg-yellow-100 text-yellow-800', emoji: '🏠' },
    { id: 'ropa', nombre: 'Ropa', color: 'bg-pink-100 text-pink-800', emoji: '👕' },
    { id: 'otros', nombre: 'Otros', color: 'bg-gray-100 text-gray-800', emoji: '📦' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descripcion || !formData.monto || !formData.categoria) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (!user) {
      toast.error('Debes estar autenticado para agregar gastos')
      return
    }

    setIsSubmitting(true)

    try {
      await expenseService.create({
        descripcion: formData.descripcion.trim(),
        monto: parseFloat(formData.monto),
        categoria: formData.categoria,
        fecha: formData.fecha,
        userId: user.id,
      })

      toast.success('Gasto agregado correctamente')
      onExpenseAdded?.()
      onClose()
    } catch (error) {
      console.error('Error al agregar gasto:', error)
      toast.error('Error al agregar el gasto. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
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
            <h2 className="text-xl font-bold text-gray-900">Nuevo Gasto</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Almuerzo en restaurante"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categoría *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categorias.map((categoria) => (
                  <motion.button
                    key={categoria.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.id }))}
                    disabled={isSubmitting}
                    className={`p-3 rounded-lg border-2 transition-all btn-touch disabled:opacity-50 ${
                      formData.categoria === categoria.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{categoria.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {categoria.nombre}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors btn-touch disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors btn-touch flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5" />
                    <span>Agregar</span>
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
