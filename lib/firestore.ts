import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Expense, FixedExpense, Budget, User, LocalExpense } from '@/types'

// Utilidades para convertir datos de Firestore
const convertTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate()
}

const convertExpenseFromFirestore = (
  doc: QueryDocumentSnapshot<DocumentData>
): LocalExpense => {
  const data = doc.data()
  return {
    id: doc.id,
    descripcion: data.descripcion,
    monto: data.monto,
    categoria: data.categoria,
    fecha: data.fecha,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    userId: data.userId,
  }
}

// Servicios para gastos
export const expenseService = {
  // Crear un nuevo gasto
  async create(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  // Obtener gastos del usuario
  async getByUser(userId: string, limitCount = 50): Promise<LocalExpense[]> {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertExpenseFromFirestore)
  },

  // Obtener gastos del mes actual
  async getCurrentMonthByUser(userId: string): Promise<LocalExpense[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const startDate = startOfMonth.toISOString().split('T')[0]
    const endDate = endOfMonth.toISOString().split('T')[0]

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('fecha', '>=', startDate),
      where('fecha', '<=', endDate),
      orderBy('fecha', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertExpenseFromFirestore)
  },

  // Actualizar gasto
  async update(id: string, data: Partial<Expense>) {
    const docRef = doc(db, 'expenses', id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  // Eliminar gasto
  async delete(id: string) {
    await deleteDoc(doc(db, 'expenses', id))
  },
}

// Servicios para usuarios
export const userService = {
  // Crear o actualizar usuario
  async createOrUpdate(userData: Omit<User, 'createdAt' | 'updatedAt'>) {
    const userRef = doc(db, 'users', userData.id)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      // Usuario existe, actualizar
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      })
    } else {
      // Usuario nuevo, crear
      const now = Timestamp.now()
      await updateDoc(userRef, {
        ...userData,
        createdAt: now,
        updatedAt: now,
      })
    }
  },

  // Obtener usuario por ID
  async getById(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', id))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User
    }
    return null
  },
}

// Servicios para gastos fijos
export const fixedExpenseService = {
  async create(data: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'fixedExpenses'), {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async getByUser(userId: string): Promise<FixedExpense[]> {
    const q = query(
      collection(db, 'fixedExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('fechaVencimiento', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FixedExpense[]
  },

  async update(id: string, data: Partial<FixedExpense>) {
    await updateDoc(doc(db, 'fixedExpenses', id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(id: string) {
    await updateDoc(doc(db, 'fixedExpenses', id), {
      isActive: false,
      updatedAt: Timestamp.now(),
    })
  },
}

// Servicios para presupuestos
export const budgetService = {
  async createOrUpdate(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) {
    // Buscar presupuesto existente para el mes/año
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', budgetData.userId),
      where('mes', '==', budgetData.mes),
      where('año', '==', budgetData.año)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      // Actualizar existente
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        ...budgetData,
        updatedAt: Timestamp.now(),
      })
      return querySnapshot.docs[0].id
    } else {
      // Crear nuevo
      const now = Timestamp.now()
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budgetData,
        createdAt: now,
        updatedAt: now,
      })
      return docRef.id
    }
  },

  async getCurrentMonth(userId: string): Promise<Budget | null> {
    const now = new Date()
    const mes = now.getMonth() + 1
    const año = now.getFullYear()

    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      where('mes', '==', mes),
      where('año', '==', año)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Budget
    }
    return null
  },
}
