'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'

export function ExpenseList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Datos de ejemplo
  const gastos = [
    {
      id: 1,
      descripcion: 'Almuerzo en McDonald\'s',
      monto: 45.50,
      categoria: 'alimentacion',
      fecha: '2024-08-02',
      emoji: '🍽️'
    },
    {
      id: 2,
      descripcion: 'Gasolina para el auto',
      monto: 75.00,
      categoria: 'transporte',
      fecha: '2024-08-01',
      emoji: '🚗'
    },
    {
      id: 3,
      descripcion: 'Entrada al cine',
      monto: 25.30,
      categoria: 'entretenimiento',
      fecha: '2024-07-31',
      emoji: '🎬'
    },
    {
      id: 4,
      descripcion: 'Compras en supermercado',
      monto: 120.75,
      categoria: 'alimentacion',
      fecha: '2024-07-30',
      emoji: '🍽️'
    },
    {
      id: 5,
      descripcion: 'Medicamentos',
      monto: 35.20,
      categoria: 'salud',
      fecha: '2024-07-29',
      emoji: '⚕️'
    },
  ]

  const categorias = [
    { id: 'all', nombre: 'Todos', color: 'bg-gray-100 text-gray-800' },
    { id: 'alimentacion', nombre: 'Alimentación', color: 'bg-green-100 text-green-800' },
    { id: 'transporte', nombre: 'Transporte', color: 'bg-blue-100 text-blue-800' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: 'bg-purple-100 text-purple-800' },
    { id: 'salud', nombre: 'Salud', color: 'bg-red-100 text-red-800' },
  ]

  const gastosFiltrados = gastos.filter(gasto => {
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
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{gasto.emoji}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{gasto.descripcion}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(gasto.fecha)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${gasto.monto}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    categorias.find(c => c.id === gasto.categoria)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {categorias.find(c => c.id === gasto.categoria)?.nombre}
                  </span>
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
    </div>
  )
}
