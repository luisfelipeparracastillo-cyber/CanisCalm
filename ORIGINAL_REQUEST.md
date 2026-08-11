# Original User Request

## Initial Request — 2026-08-06T18:17:29-05:00

Desarrollar CanisCalm, una aplicación web full-stack integral para el manejo y entrenamiento de perros reactivos, que combina rastreo GPS de paseos en tiempo real con marcado de detonantes, base de datos relacional de razas de perros con perfiles de temperamento, y módulo de analítica y guías de desensibilización.

Working directory: c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity
Integrity mode: development

## Requirements

### R1. Arquitectura Full-Stack y Tema Calming Nature
- Desarrollar un backend con Node.js + Express y SQLite (better-sqlite3) para persistencia de datos (razas, perfiles de perros, paseos y eventos de reactividad).
- Desarrollar un frontend en React (Vite) con estilo visual Clean & Calming Nature (paleta de salvia #4E6E58, terracota #D97757 y crema cálido #FAF8F5, tarjetas redondeadas, tipografía serena y micro-animaciones).

### R2. Rastreo GPS en Tiempo Real y Marcado de Detonantes (Modo Paseo)
- Implementar rastreo de ubicación GPS en tiempo real usando Geolocation API.
- Renderizar mapa interactivo con trazado de ruta en vivo y soporte dual (Google Maps API + fallback automático interactivo con Leaflet/OpenStreetMap).
- Incluir panel de registro rápido (1-tap) para marcar detonantes (Perro sin correa, Bici/Patineta, Persona/Niño, Ruido Fuerte, Vehículo) asignando escala de intensidad de reactividad (1 a 5), nota y coordenadas GPS en vivo.

### R3. Base de Datos de Razas y Perfiles de Mascotas
- Enciclopedia interactiva de razas de perros precargada en SQLite con filtrado por Nivel de Energía, Impulso de Presa, Sensibilidad y Umbral de Excitación.
- Gestión de perfiles de perros creados por el usuario, vinculando la raza del perro con sus detonantes específicos y metas de entrenamiento.

### R4. Guía de Entrenamiento de Desensibilización y Analítica de Progreso
- Módulo de guía interactiva paso a paso para técnicas de modificación de conducta canina (Look At That - LAT, Contracondicionamiento, Zonas de Confort, Regla de 3 Segundos).
- Dashboard de analítica con gráficos de frecuencia de episodios de reactividad, mapa de puntos calientes de detonantes e historial de paseos.

## Acceptance Criteria

### Servidor Backend & Base de Datos
- [ ] El servidor Express inicia correctamente y se conecta a la base de datos SQLite.
- [ ] La base de datos SQLite contiene tablas creadas para breeds, dogs, walks y reactivity_events, precargada con datos de razas caninas.
- [ ] Los endpoints REST (/api/breeds, /api/dogs, /api/walks, /api/stats) responden correctamente con formato JSON.

### Frontend React & UI Calming Nature
- [ ] La aplicación React compila sin errores usando Vite (npm run dev / npm run build).
- [ ] El diseño cumple rigurosamente la estética Clean & Calming Nature en todos los componentes.
- [ ] Navegación fluida entre las secciones: Paseo en Vivo GPS, Enciclopedia de Razas, Mis Perros, Entrenamiento y Analítica.

### Rastreador GPS y Marcador de Eventos
- [ ] El mapa interactivo muestra la ubicación actual del usuario y traza la ruta recorrida.
- [ ] Los botones de registro de detonante (1-tap) guardan el evento con coordenadas GPS, tipo de detonante e intensidad (1-5) en SQLite.
- [ ] Los puntos de reacción se visualizan en el mapa con marcadores de color según el nivel de intensidad.

### Verificación Programática
- [ ] npm run build en la raíz genera el paquete de producción sin errores de sintaxis o empaquetado.
