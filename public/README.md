# 🐎 Polla Central Park - Turf Edition

¡Bienvenido al sistema oficial de gestión de apuestas hípicas para la **Polla Central Park**! Esta plataforma es una solución integral diseñada para automatizar el registro, la validación y el seguimiento en tiempo real de las jugadas de las 6 válidas.

## 🚀 Propósito del Proyecto
Este sistema elimina la necesidad de gestionar jugadas por cuadernos o mensajes de texto desordenados. Permite que los apostadores registren sus caballos y que el administrador valide los pagos de forma centralizada, manteniendo la transparencia y la emoción con una tabla de posiciones en vivo.

---

## 🛠️ Características Principales

### 💎 Interfaz de Usuario (UX/UI)
- **Diseño Hipódromo Premium:** Estética inspirada en el turf profesional con paletas de verdes grama, dorados y texturas elegantes.
- **Efecto de Ticket Real:** El módulo de pago (`pago.html`) simula un ticket físico de taquilla con bordes troquelados.
- **Responsivo:** Optimizado para que los apostadores jueguen desde su celular en el hipódromo.

### 🧠 El Cerebro (Lógica de Negocio)
- **Buzón de Solicitudes:** Las jugadas nuevas entran en un estado de "Pendiente" invisible para el público.
- **Panel de Comisario (Admin):** El administrador (gonzalezgamez70@gmail.com) posee herramientas exclusivas:
  - Aprobar jugadas con un clic (las mueve a la tabla oficial).
  - Editar puntos de cada válida en tiempo real.
  - Eliminar registros.
- **Tabla en Vivo:** Los resultados se actualizan instantáneamente para todos los usuarios sin necesidad de recargar la página.

### 💳 Gestión de Pagos
- **Taquilla Digital:** Módulo con datos de Pago Móvil (Banco de Venezuela).
- **Copiado Inteligente:** Botones que limpian puntos y guiones de la cédula/teléfono para facilitar el pegado en la App del banco.
- **Redirección a WhatsApp:** Enlace directo para reportar el pago con mensaje pre-configurado.

---

## 🛠️ Tecnologías Utilizadas
- **Frontend:** HTML5, CSS3 (Tailwind CSS para un diseño ultra rápido).
- **Backend/Base de Datos:** Firebase Firestore (Base de datos NoSQL en tiempo real).
- **Autenticación:** Firebase Auth (Para asegurar el acceso del administrador).

---

## 📁 Estructura de Archivos
- `index.html`: La aplicación principal (Formulario, Tabla y Panel Admin).
- `index.js`: Lógica de conexión con Firebase y gestión de estados.
- `auth.html / auth.js`: Sistema de ingreso para usuarios y admin.
- `pago.html`: Interfaz de taquilla de pago móvil.
- `firebase-config.js`: Credenciales de conexión a la base de datos.

---

## ⚙️ Instalación y Configuración
1. Clona este repositorio.
2. Configura un proyecto en [Firebase Console](https://console.firebase.google.com/).
3. Habilita **Firestore Database** y **Email/Password Auth**.
4. Copia tus credenciales en `firebase-config.js`.
5. Define las **Security Rules** en Firestore para proteger los datos:
   ```javascript
   allow read, write: if request.auth.token.email == "gonzalezgamez70@gmail.com";