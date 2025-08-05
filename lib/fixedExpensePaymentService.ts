import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FixedExpensePayment } from '@/types'

const COLLECTION_NAME = 'fixedExpensePayments'

// Helper function para verificar que Firebase esté configurado
function requireFirestore() {
  if (!db) {
    throw new Error('Firebase no está configurado. Las variables de entorno no están disponibles.')
  }
  return db
}

export const fixedExpensePaymentService = {
  // Crear un nuevo pago de gasto fijo
  create: async (payment: Omit<FixedExpensePayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const firestore = requireFirestore()
    const now = Timestamp.now()
    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), {
      ...payment,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  },

  // Obtener pagos por usuario y mes/año
  getByUserAndMonth: async (userId: string, mes: number, año: number): Promise<FixedExpensePayment[]> => {
    const firestore = requireFirestore()
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('userId', '==', userId),
      where('mes', '==', mes),
      where('año', '==', año)
    )
    
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FixedExpensePayment))
    
    return results
  },

  // Obtener pagos por gasto fijo específico
  getByFixedExpense: async (fixedExpenseId: string): Promise<FixedExpensePayment[]> => {
    const firestore = requireFirestore()
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('fixedExpenseId', '==', fixedExpenseId)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FixedExpensePayment))
  },

  // Obtener pago específico por gasto fijo, mes y año
  getByFixedExpenseAndMonth: async (
    fixedExpenseId: string,
    userId: string,
    mes: number, 
    año: number
  ): Promise<FixedExpensePayment | null> => {
    const firestore = requireFirestore()
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('fixedExpenseId', '==', fixedExpenseId),
      where('userId', '==', userId),
      where('mes', '==', mes),
      where('año', '==', año)
    )
    
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as FixedExpensePayment
  },

  // Marcar como pagado o crear pago
  markAsPaid: async (
    fixedExpenseId: string,
    userId: string,
    mes: number,
    año: number,
    monto: number,
    fechaPago: string
  ): Promise<void> => {
    const firestore = requireFirestore()
    
    // Buscar si ya existe un registro para este mes/año
    const existingPayment = await fixedExpensePaymentService.getByFixedExpenseAndMonth(
      fixedExpenseId,
      userId,
      mes, 
      año
    )

    if (existingPayment) {
      // Actualizar el existente
      await updateDoc(doc(firestore, COLLECTION_NAME, existingPayment.id), {
        monto,
        fechaPago,
        isPagado: true,
        updatedAt: Timestamp.now()
      })
    } else {
      // Crear nuevo registro
      await fixedExpensePaymentService.create({
        fixedExpenseId,
        userId,
        mes,
        año,
        monto,
        fechaPago,
        isPagado: true
      })
    }
  },

  // Marcar como pendiente
  markAsPending: async (
    fixedExpenseId: string,
    userId: string,
    mes: number,
    año: number
  ): Promise<void> => {
    const firestore = requireFirestore()
    const existingPayment = await fixedExpensePaymentService.getByFixedExpenseAndMonth(
      fixedExpenseId,
      userId,
      mes, 
      año
    )

    if (existingPayment) {
      await updateDoc(doc(firestore, COLLECTION_NAME, existingPayment.id), {
        isPagado: false,
        updatedAt: Timestamp.now()
      })
    } else {
      // Crear registro como pendiente
      await fixedExpensePaymentService.create({
        fixedExpenseId,
        userId,
        mes,
        año,
        monto: 0,
        fechaPago: '',
        isPagado: false
      })
    }
  },

  // Actualizar pago
  update: async (id: string, updates: Partial<FixedExpensePayment>): Promise<void> => {
    const firestore = requireFirestore()
    await updateDoc(doc(firestore, COLLECTION_NAME, id), {
      ...updates,
      updatedAt: Timestamp.now()
    })
  },

  // Eliminar pago
  delete: async (id: string): Promise<void> => {
    const firestore = requireFirestore()
    await deleteDoc(doc(firestore, COLLECTION_NAME, id))
  },

  // Obtener resumen de pagos para un mes específico
  getMonthlyPaymentsSummary: async (userId: string, mes: number, año: number): Promise<{
    totalPagado: number,
    totalPendiente: number,
    pagosPagados: FixedExpensePayment[],
    pagosPendientes: FixedExpensePayment[]
  }> => {
    const payments = await fixedExpensePaymentService.getByUserAndMonth(userId, mes, año)
    
    const pagosPagados = payments.filter(p => p.isPagado)
    const pagosPendientes = payments.filter(p => !p.isPagado)
    
    const totalPagado = pagosPagados.reduce((sum, p) => sum + p.monto, 0)
    const totalPendiente = pagosPendientes.length

    return {
      totalPagado,
      totalPendiente,
      pagosPagados,
      pagosPendientes
    }
  }
}
