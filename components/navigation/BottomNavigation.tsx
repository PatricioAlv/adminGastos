'use client'

import { HomeIcon, ListBulletIcon, CreditCardIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: HomeIcon },
    { id: 'expenses', label: 'Gastos', icon: ListBulletIcon },
    { id: 'fixed', label: 'Fijos', icon: CreditCardIcon },
    { id: 'settings', label: 'Config', icon: Cog6ToothIcon },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-20">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors btn-touch ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
