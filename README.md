# PrimaCult Wallet Web3 - Sistema de Autenticación y Gestión de NFTs

Este proyecto implementa un sistema completo de autenticación Web3 con base de datos para gestionar NFTs de usuarios. Los usuarios solo pueden personalizar NFTs que posean.

## 🚀 Características

- **Autenticación Web3**: Login con MetaMask, WalletConnect y otras wallets
- **Base de datos**: Almacenamiento de usuarios y sus NFTs
- **Verificación de propiedad**: Solo permite modificar NFTs del usuario
- **Dashboard personalizado**: Muestra NFTs del usuario
- **Customizador protegido**: Interfaz para personalizar NFTs propios

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear y sincronizar la base de datos
npm run db:push

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run db:studio
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

## 🏗️ Arquitectura del Sistema

### Flujo de Autenticación

1. **Conexión de Wallet**: Usuario conecta su wallet (MetaMask, etc.)
2. **Firma de Mensaje**: Se solicita al usuario que firme un mensaje
3. **Verificación**: Se verifica la firma usando ethers.js
4. **Autenticación**: Se crea/recupera el usuario en la base de datos
5. **Redirección**: Usuario es enviado al dashboard

### Estructura de Base de Datos

- **User**: Información del usuario (wallet address)
- **NFT**: NFTs del usuario con metadata
- **UserSession**: Sesiones de usuario (opcional)

### Rutas Protegidas

- `/dashboard`: Lista de NFTs del usuario
- `/customizer/[nftId]`: Personalizador para un NFT específico

## 🔐 Seguridad

- **Verificación de firma**: Solo usuarios con acceso a la wallet pueden autenticarse
- **Verificación de propiedad**: Los usuarios solo pueden modificar NFTs que posean
- **Sesiones JWT**: Autenticación persistente y segura

## 📱 Uso

### Para Usuarios

1. Conecta tu wallet en la página principal
2. Firma el mensaje de autenticación
3. Accede a tu dashboard personal
4. Selecciona un NFT para personalizar
5. Usa el customizador para modificar tu NFT

### Para Desarrolladores

- **API Routes**: `/api/auth/*`, `/api/user/nfts`
- **Componentes**: `Web3Auth`, `Dashboard`, `Customizer`
- **Base de datos**: Prisma con SQLite (configurable para producción)

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="secreto-super-seguro-de-produccion"
NEXTAUTH_URL="https://tu-dominio.com"
```

### Base de Datos de Producción

Para producción, se recomienda usar PostgreSQL:

```bash
# Cambiar provider en prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🔧 Personalización

### Agregar Nuevos Traits

1. Actualizar el esquema de Prisma
2. Modificar las API routes
3. Actualizar los componentes del frontend

### Integrar con Smart Contracts

1. Agregar verificación on-chain de propiedad
2. Implementar eventos de transferencia
3. Sincronizar con la base de datos

## 📚 Dependencias Principales

- **Next.js 15**: Framework de React
- **NextAuth.js**: Autenticación
- **Prisma**: ORM para base de datos
- **Wagmi**: Hooks para Ethereum
- **Web3Modal**: Conexión de wallets
- **Ethers.js**: Interacción con blockchain

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
