# AdminGastos 💰

Una aplicación web moderna y responsive para el control de gastos personales, optimizada especialmente para dispositivos móviles.

## 🚀 Características Principales

### ✅ Implementadas
- **Diseño Mobile-First**: Interfaz optimizada para smartphones y tablets
- **Dashboard Interactivo**: Resumen visual de gastos mensuales
- **Gestión de Gastos**: Agregar, editar y categorizar gastos
- **Categorías Personalizadas**: Sistema de categorías con emojis y colores
- **Búsqueda y Filtros**: Encontrar gastos específicos fácilmente
- **Navegación Táctil**: Botones optimizados para touch (44px mínimo)
- **Animaciones Suaves**: Transiciones fluidas con Framer Motion
- **PWA Ready**: Manifiesto configurado para instalación como app

### 🔄 En Desarrollo
- **Autenticación Completa**: Sistema de login y registro
- **Base de Datos**: Integración con Prisma y base de datos
- **Gastos Fijos**: Gestión de gastos recurrentes
- **Gráficos y Reportes**: Análisis visual de gastos
- **Presupuestos**: Sistema de límites y alertas
- **Sincronización**: Backup en la nube

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Heroicons
- **Base de Datos**: Prisma (próximamente)
- **Autenticación**: NextAuth.js (próximamente)

## 📱 Diseño Mobile-First

La aplicación está diseñada pensando en el uso móvil:

- **Navegación Inferior**: Acceso rápido a secciones principales
- **Botones Táctiles**: Mínimo 44px para facilitar el toque
- **Formularios Optimizados**: Teclados específicos y sin zoom en iOS
- **Gestos Intuitivos**: Swipe y tap mejorados
- **Modo Oscuro**: Adaptación automática al sistema

## 🎯 Funcionalidades Sugeridas

### Esenciales
- [x] Dashboard con resumen mensual
- [x] Agregar gastos con categorías
- [x] Lista y búsqueda de gastos
- [ ] Gastos fijos y recurrentes
- [ ] Sistema de presupuestos
- [ ] Autenticación de usuarios

### Avanzadas
- [ ] Gráficos y análisis de tendencias
- [ ] Exportar datos (PDF, Excel)
- [ ] Recordatorios de gastos fijos
- [ ] Múltiples cuentas/tarjetas
- [ ] Fotos de recibos
- [ ] Compartir gastos familiares
- [ ] Metas de ahorro
- [ ] Comparación mes a mes

### Mejoras UX
- [ ] Modo oscuro
- [ ] Widgets de escritorio
- [ ] Notificaciones push
- [ ] Accesos directos
- [ ] Gestos personalizados
- [ ] Temas de colores

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus configuraciones
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
adminGastos/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── dashboard/         # Componentes del dashboard
│   ├── expenses/          # Gestión de gastos
│   ├── layout/           # Layout y navegación
│   ├── navigation/       # Navegación móvil
│   └── providers/        # Providers de contexto
├── public/               # Archivos estáticos
│   └── manifest.json     # PWA manifest
└── README.md            # Este archivo
```

## 🎨 Guía de Diseño

### Colores
- **Primario**: Azul (#0ea5e9)
- **Secundario**: Gris (#64748b)
- **Éxito**: Verde (#22c55e)
- **Peligro**: Rojo (#ef4444)
- **Advertencia**: Amarillo (#f59e0b)

### Categorías de Gastos
- 🍽️ Alimentación (Verde)
- 🚗 Transporte (Azul)
- 🎬 Entretenimiento (Púrpura)
- ⚕️ Salud (Rojo)
- 📚 Educación (Índigo)
- 🏠 Hogar (Amarillo)
- 👕 Ropa (Rosa)
- 📦 Otros (Gris)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙋‍♂️ Soporte

Si tienes preguntas o necesitas ayuda:

- Abre un [Issue](../../issues)
- Contacta al desarrollador

---

**¡Gracias por usar AdminGastos! 🎉**
