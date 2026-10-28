# View Model 3D AI

Interfaz web en React + Vite + TypeScript, con visor 3D interactivo (Three.js / React Three Fiber) y backend Express.

## Requisitos
- Node.js 20 o superior
- npm

## Iniciar en tu computador
1. Descomprime el ZIP.
2. Abre la carpeta del proyecto en una terminal.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.
5. Abre la dirección que muestra Vite (normalmente `http://localhost:5173`).

El servidor API corre en el puerto `8787`; Vite reenvía `/api` a ese servidor.

## Qué funciona en este prototipo
- Interfaz profesional adaptable a escritorio y móvil.
- Visor 3D orbitable con zoom y cuadrícula.
- Modelos de demostración generados proceduralmente.
- Selección de color, modo alambre y biblioteca local durante la sesión.
- Campo de texto para enviar prompts al backend.
- Importación y descarga del archivo original seleccionado.
- Endpoint de salud: `GET /api/health`.
- Endpoint de generación de prueba: `POST /api/generate`.

## Importante: generación real por IA
Este prototipo **todavía no genera mallas 3D de calidad Meshy ni texturas PBR reales**. El modo demo crea una vista previa procedural y nunca debe confundirse con un modelo exportable. Para cumplir el objetivo de calidad se necesita integrar un proveedor real de generación 3D y texturizado, implementar su flujo de trabajos y procesar el formato de salida (por ejemplo GLB/GLTF con mapas PBR).

No existe una forma honesta de prometer calidad idéntica a Meshy y descargas ilimitadas gratuitas sin conocer las capacidades, licencia, límites y coste del proveedor. La web se puede ofrecer gratis; la generación avanzada dependerá de un modelo/proveedor gratuito o de recursos propios y de sus condiciones. No expongas claves privadas en el frontend.

## Punto de integración
- `server/index.ts`: función `generateWithProvider()` es el adaptador donde se implementa la API elegida.
- `.env.example`: variables previstas para configurar proveedor y clave.

Antes de publicar, implementar autenticación, cuotas, límites de coste, validación de archivos y almacenamiento seguro.


## Publicar en Render
1. Sube esta carpeta a un repositorio de GitHub (no subas claves secretas).
2. Entra en https://render.com/ e inicia sesión.
3. Selecciona **New + → Blueprint** y conecta el repositorio. Render detectará `render.yaml`.
4. Confirma la creación del servicio. Cuando el despliegue termine, Render mostrará la URL pública `https://...onrender.com`.
5. Abre esa URL y comprueba que la página carga. El endpoint `/api/health` sirve para comprobar el servidor.

El plan gratuito puede suspender el servicio cuando está inactivo y tardar un poco en arrancar. La web publicada sigue siendo una demo: publicar no activa generación real por IA ni texturizado PBR.
