# 🔥 Reglas de Firestore para AdminGastos

## Reglas actuales recomendadas

Copia y pega estas reglas en Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gastos - cualquier usuario autenticado puede leer/escribir sus propios gastos
    match /expenses/{expenseId} {
      // Permitir lectura si el usuario está autenticado y es el propietario
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Permitir escritura/actualización si el usuario está autenticado y es el propietario
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Permitir creación si el usuario está autenticado y es el propietario
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Gastos fijos
    match /fixedExpenses/{fixedExpenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Presupuestos
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 🚨 Reglas temporales para debugging

Si sigues teniendo problemas, puedes usar estas reglas temporales MÁS PERMISIVAS para hacer debugging:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORAL: Permite todo para usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **IMPORTANTE**: Las reglas temporales son inseguras. Úsalas solo para debugging y luego cambia a las reglas seguras.

## 🔍 Debugging

1. **Verificar autenticación**: Ve a Firebase Console → Authentication → Users
2. **Verificar datos**: Ve a Firebase Console → Firestore Database → Data
3. **Verificar reglas**: Ve a Firebase Console → Firestore Database → Rules
4. **Probar reglas**: Usa el simulador de reglas en Firebase Console

## 📈 Índices necesarios

Para consultas optimizadas, necesitas estos índices compuestos en Firebase Console → Firestore Database → Indexes:

### Índice para gastos por usuario y fecha:
- **Colección**: `expenses`
- **Campos**: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Índice para gastos por usuario y fecha específica:
- **Colección**: `expenses`  
- **Campos**:
  - `userId` (Ascending)
  - `fecha` (Ascending)
  - `createdAt` (Descending)

**Nota**: Firebase creará estos índices automáticamente cuando ejecutes las consultas y aparezca el error con el enlace.

## 📊 Estructura esperada en Firestore

### Colección `expenses`:
```
expenses/
  ├── [documentId]/
  │   ├── descripcion: "Almuerzo"
  │   ├── monto: 25.50
  │   ├── categoria: "alimentacion"
  │   ├── fecha: "2025-08-02"
  │   ├── userId: "user_id_from_auth"
  │   ├── createdAt: Timestamp
  │   └── updatedAt: Timestamp
```

### Colección `users`:
```
users/
  ├── [userId]/
  │   ├── id: "user_id"
  │   ├── email: "usuario@gmail.com"
  │   ├── name: "Nombre Usuario"
  │   ├── photoURL: "https://..."
  │   ├── createdAt: Timestamp
  │   └── updatedAt: Timestamp
```
