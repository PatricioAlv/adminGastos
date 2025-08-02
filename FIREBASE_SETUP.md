# 🔥 Configuración de Firebase para AdminGastos

## 📋 Pasos para configurar Firebase

### 1. **Configurar Firebase Project**

Ya tienes tu proyecto de Firebase creado. Ahora necesitas:

#### a) **Habilitar Authentication con Google**
1. Ve a Firebase Console → **Authentication** → **Sign-in method**
2. Habilita **Google** como proveedor
3. Configura el email de soporte del proyecto
4. Guarda los cambios

#### b) **Crear Firestore Database**
1. Ve a Firebase Console → **Firestore Database**
2. Clic en **Create database**
3. Selecciona **Start in test mode** (por ahora)
4. Elige la región más cercana a tus usuarios

#### c) **Configurar reglas de Firestore**
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gastos solo para el usuario autenticado
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Gastos fijos solo para el usuario autenticado
    match /fixedExpenses/{fixedExpenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Presupuestos solo para el usuario autenticado
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 2. **Obtener configuraciones de Firebase**

1. Ve a Firebase Console → **Project Settings** (⚙️)
2. Baja hasta **Your apps** → **Web apps**
3. Si no tienes una app web, clic en **Add app** y crea una
4. Copia el objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 3. **Configurar variables de entorno**

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# Copia desde .env.local.example
cp .env.local.example .env.local
```

Edita `.env.local` con tus configuraciones:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key-real"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"
```

### 4. **Configurar dominio autorizado**

1. Ve a Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Agrega `localhost` (ya debería estar)
3. Cuando despliegues, agrega tu dominio de producción

### 5. **Probar la configuración**

```bash
# Reinicia el servidor de desarrollo
npm run dev
```

Ve a `http://localhost:3000` y:
1. Deberías ver la pantalla de login
2. Clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Si todo está bien, te redirigirá al dashboard

---

## 🚀 **Estructura de datos en Firestore**

### **Colecciones creadas automáticamente:**

#### `/users/{userId}`
```json
{
  "id": "user_id_from_auth",
  "email": "usuario@gmail.com",
  "name": "Nombre Usuario",
  "photoURL": "https://...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `/expenses/{expenseId}`
```json
{
  "descripcion": "Almuerzo en restaurante",
  "monto": 45.50,
  "categoria": "alimentacion",
  "fecha": "2024-08-02",
  "userId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `/fixedExpenses/{fixedExpenseId}` (próximamente)
```json
{
  "descripcion": "Internet Movistar",
  "monto": 89.99,
  "categoria": "hogar", 
  "fechaVencimiento": 15,
  "isActive": true,
  "userId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `/budgets/{budgetId}` (próximamente)
```json
{
  "mes": 8,
  "año": 2024,
  "limite": 5000.00,
  "gastado": 0,
  "userId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🔒 **Seguridad**

### **Reglas de Firestore aplicadas:**
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Cada usuario solo ve sus propios datos
- ✅ No hay acceso cruzado entre usuarios
- ✅ Validación de ownership en todas las operaciones

### **Variables de entorno:**
- ✅ Todas las configuraciones en `.env.local`
- ✅ Archivo `.env.local` en `.gitignore`
- ✅ Claves públicas seguras (NEXT_PUBLIC_)

---

## 🐛 **Troubleshooting**

### Error: "Firebase configuration missing"
- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor: `npm run dev`

### Error: "Auth domain not authorized"
- Agrega `localhost` en Authentication → Settings → Authorized domains

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de estar autenticado

### Error: "Google Sign-In not working"
- Verifica que Google está habilitado en Authentication
- Revisa la configuración del proveedor de Google

---

## 🎯 **Próximos pasos**

Una vez que Firebase esté funcionando:

1. **Probar agregar gastos** - Deberían guardarse en Firestore
2. **Verificar datos en Firebase Console** - Ve a Firestore Database
3. **Implementar gastos fijos** - Próxima funcionalidad
4. **Agregar presupuestos** - Sistema de límites
5. **Crear gráficos** - Visualización de datos

---

## 📱 **Para producción**

Cuando despliegues la app:

1. **Cambiar Firestore a modo producción**
2. **Agregar dominio de producción** a authorized domains
3. **Configurar variables de entorno** en tu hosting
4. **Opcional: configurar Firebase Hosting**

---

¿Necesitas ayuda con algún paso específico? ¡Avísame!
