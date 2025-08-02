'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cog6ToothIcon, 
  CurrencyDollarIcon,
  BellIcon,
  SwatchIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/AuthProvider'
import { userSettingsService } from '@/lib/firestore'
import { UserSettings } from '@/types'
import toast from 'react-hot-toast'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    monthlyBudget: 50000,
    enableNotifications: true,
    notifyBeforeDueDate: 3,
    notifyBudgetPercentage: 80,
    currency: 'ARS',
    dateFormat: 'DD/MM/YYYY',
    theme: 'auto' as 'light' | 'dark' | 'auto',
    defaultExpenseCategory: 'otros',
    defaultFixedExpenseCategory: 'hogar',
    enableAutoBackup: false,
    backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    monthStartDay: 1,
  })

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const userSettings = await userSettingsService.getOrCreateDefault(user.id)
        setSettings(userSettings)
        setFormData({
          monthlyBudget: userSettings.monthlyBudget,
          enableNotifications: userSettings.enableNotifications,
          notifyBeforeDueDate: userSettings.notifyBeforeDueDate,
          notifyBudgetPercentage: userSettings.notifyBudgetPercentage,
          currency: userSettings.currency,
          dateFormat: userSettings.dateFormat,
          theme: userSettings.theme,
          defaultExpenseCategory: userSettings.defaultExpenseCategory,
          defaultFixedExpenseCategory: userSettings.defaultFixedExpenseCategory,
          enableAutoBackup: userSettings.enableAutoBackup,
          backupFrequency: userSettings.backupFrequency,
          monthStartDay: userSettings.monthStartDay,
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Error al cargar la configuración')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      await userSettingsService.createOrUpdate(user.id, formData)
      toast.success('Configuración guardada correctamente')
      onClose()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const categorias = [
    { id: 'hogar', nombre: 'Hogar', emoji: '🏠' },
    { id: 'transporte', nombre: 'Transporte', emoji: '🚗' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', emoji: '🎬' },
    { id: 'salud', nombre: 'Salud', emoji: '⚕️' },
    { id: 'educacion', nombre: 'Educación', emoji: '📚' },
    { id: 'alimentacion', nombre: 'Alimentación', emoji: '🍽️' },
    { id: 'ropa', nombre: 'Ropa', emoji: '👕' },
    { id: 'otros', nombre: 'Otros', emoji: '📦' },
  ]

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="bg-white w-full sm:w-[500px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Presupuesto */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Presupuesto Mensual</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto disponible por mes
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) => handleInputChange('monthlyBudget', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="50000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alerta cuando gastes el
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.notifyBudgetPercentage}
                    onChange={(e) => handleInputChange('notifyBudgetPercentage', Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BellIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Habilitar notificaciones
                </span>
                <button
                  onClick={() => handleInputChange('enableNotifications', !formData.enableNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableNotifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {formData.enableNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recordar gastos fijos con
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.notifyBeforeDueDate}
                      onChange={(e) => handleInputChange('notifyBeforeDueDate', Number(e.target.value))}
                      className="w-full pr-16 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">días</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">días de anticipación</p>
                </div>
              )}
            </div>
          </div>

          {/* Apariencia */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SwatchIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Apariencia</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Claro', icon: '☀️' },
                    { value: 'dark', label: 'Oscuro', icon: '🌙' },
                    { value: 'auto', label: 'Auto', icon: '🔄' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleInputChange('theme', theme.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.theme === theme.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg mb-1">{theme.icon}</div>
                      <div className="text-xs font-medium">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="CLP">Peso Chileno (CLP)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato de fecha
                </label>
                <select
                  value={formData.dateFormat}
                  onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categorías por defecto */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Categorías por Defecto</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría por defecto para gastos
                </label>
                <select
                  value={formData.defaultExpenseCategory}
                  onChange={(e) => handleInputChange('defaultExpenseCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría por defecto para gastos fijos
                </label>
                <select
                  value={formData.defaultFixedExpenseCategory}
                  onChange={(e) => handleInputChange('defaultFixedExpenseCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Configuración avanzada */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CloudArrowUpIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configuración Avanzada</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de inicio del mes fiscal
                </label>
                <select
                  value={formData.monthStartDay}
                  onChange={(e) => handleInputChange('monthStartDay', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      Día {day}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Útil si tu ciclo de gastos no coincide con el mes calendario
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Respaldo automático
                  </span>
                  <p className="text-xs text-gray-500">
                    Funcionalidad próximamente
                  </p>
                </div>
                <button
                  onClick={() => handleInputChange('enableAutoBackup', !formData.enableAutoBackup)}
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50 cursor-not-allowed"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
