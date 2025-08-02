'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/AuthProvider'
import { expenseService } from '@/lib/firestore'
import { LocalExpense } from '@/types'
import { EditExpenseForm } from './EditExpenseForm'

export function ExpenseList({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<LocalExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingExpense, setEditingExpense] = useState<LocalExpense | null>(null)

  useEffect(() => {
    const loadExpenses = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const userExpenses = await expenseService.getByUser(user.id, 100) // Cargar más gastos para la lista
        setExpenses(userExpenses)
      } catch (error) {
        console.error('Error al cargar gastos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
  }, [user, refreshKey])

  const handleExpenseUpdated = () => {
    // Recargar la lista de gastos
    if (user) {
      expenseService.getByUser(user.id, 100).then(setExpenses)
    }
  }

  const handleExpenseDeleted = () => {
    // Recargar la lista de gastos
    if (user) {
      expenseService.getByUser(user.id, 100).then(setExpenses)
    }
  }

  const handleDelete = async (expense: LocalExpense) => {
    if (!confirm(`¿Eliminar "${expense.descripcion}"?`)) return
    
    try {
      await expenseService.delete(expense.id)
      setExpenses(prev => prev.filter(exp => exp.id !== expense.id))
      // toast.success('Gasto eliminado') // Descomenta si tienes toast configurado
    } catch (error) {
      console.error('Error al eliminar gasto:', error)
      // toast.error('Error al eliminar el gasto') // Descomenta si tienes toast configurado
    }
  }

  // Mapear categorías a emojis y colores
  const categoryEmojis: { [key: string]: string } = {
    'alimentacion': '🍽️',
    'transporte': '🚗',
    'entretenimiento': '🎬',
    'salud': '⚕️',
    'educacion': '📚',
    'hogar': '�',
    'ropa': '👕',
    'otros': '📦',
  }

  const categorias = [
    { id: 'all', nombre: 'Todos', color: 'bg-gray-100 text-gray-800' },
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800' },
    { id: 'educacion', nombre: 'Educación', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'hogar', nombre: 'Hogar', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'ropa', nombre: 'Ropa', color: 'bg-pink-100 text-pink-800' },
    { id: 'otros', nombre: 'Otros', color: 'bg-gray-100 text-gray-800' },
  ]

  const gastosFiltrados = expenses.filter(gasto => {
    const matchesSearch = gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || gasto.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-300 rounded-xl h-12 animate-pulse"></div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-300 rounded-full h-8 w-20 animate-pulse flex-shrink-0"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-gray-300 rounded-xl h-16 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Gastos</h2>
        <p className="text-gray-600">Historial completo de tus gastos</p>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setSelectedCategory(categoria.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors btn-touch ${
                selectedCategory === categoria.id
                  ? 'bg-primary-500 text-white'
                  : categoria.color
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de gastos */}
      <div className="space-y-3">
        {gastosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron gastos
            </h3>
            <p className="text-gray-600">
              Intenta cambiar los filtros o agregar un nuevo gasto
            </p>
          </div>
        ) : (
          gastosFiltrados.map((gasto, index) => (
            <motion.div
              key={gasto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl">{categoryEmojis[gasto.categoria] || '📦'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{gasto.descripcion}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(gasto.fecha)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${gasto.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      categorias.find(c => c.id === gasto.categoria)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {categorias.find(c => c.id === gasto.categoria)?.nombre}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingExpense(gasto)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors btn-touch"
                      title="Editar gasto"
                    >
                      <PencilIcon className="h-4 w-4 text-blue-600" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(gasto)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors btn-touch"
                      title="Eliminar gasto"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Resumen */}
      {gastosFiltrados.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 rounded-xl p-4 border border-primary-200"
        >
          <div className="flex justify-between items-center">
            <span className="text-primary-700 font-medium">Total mostrado:</span>
            <span className="text-xl font-bold text-primary-900">
              ${gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0).toLocaleString()}
            </span>
          </div>
        </motion.div>
      )}

      {/* Modal de edición */}
      {editingExpense && (
        <EditExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onExpenseUpdated={handleExpenseUpdated}
          onExpenseDeleted={handleExpenseDeleted}
        />
      )}
    </div>
  )
}
