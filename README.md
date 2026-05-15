# Cálculo Mental

Aplicación móvil de entrenamiento matemático desarrollada con React Native + Expo. Un solo jugador, sin conexión a internet, con persistencia local.

## Tecnologías

| Librería | Uso |
|----------|-----|
| Expo SDK 54 (managed workflow) + TypeScript | Base de la app |
| React Navigation 7 (native stack) | Navegación entre pantallas |
| AsyncStorage | Persistencia local (historial, récords, preferencias) |
| Context API + useReducer | Estado global (sin Redux ni Zustand) |
| React Native Reanimated 4 | Animaciones (fade, spring, scale) |
| expo-av | Efectos de sonido |

## Estructura del proyecto

```
calculosMentales/
├── App.tsx                        # Raíz: providers + init de sonidos
├── assets/
│   ├── button-click.wav           # Generado programáticamente
│   ├── mixkit-intro-transition-1146.wav
│   └── mixkit-retro-game-notification-212.wav
└── src/
    ├── types/
    │   └── types.ts               # Interfaces, enums, RootStackParamList
    ├── constants/
    │   ├── difficulty.ts          # Rangos, operadores y tiempos por dificultad
    │   └── theme.ts               # Colores dark/light, tipografía, espaciado
    ├── utils/
    │   ├── operations.ts          # Generador de operaciones
    │   ├── scoring.ts             # Cálculo de puntaje
    │   ├── storage.ts             # AsyncStorage helpers
    │   └── soundManager.ts        # Singleton de sonidos (expo-av)
    ├── hooks/
    │   ├── useTimer.ts            # Countdown con callback onTimeout
    │   ├── useOperationGenerator.ts
    │   ├── useGameLogic.ts        # Orquesta una ronda completa
    │   └── useSound.ts            # Wrapper de soundManager para GameScreen
    ├── contexts/
    │   ├── SettingsContext.tsx    # Tema, preferencias (persiste entre sesiones)
    │   └── GameContext.tsx        # Historial y récords en memoria
    ├── navigation/
    │   └── AppNavigator.tsx       # Stack navigator tipado
    ├── components/
    │   ├── TimerBar.tsx           # Barra de progreso con cambio de color
    │   ├── NumericKeyboard.tsx    # Teclado 0-9 + borrar + signo negativo
    │   ├── OperationDisplay.tsx   # Expresión con fade-in por operación
    │   ├── AnimatedScore.tsx      # Contador animado al mostrar resultado
    │   ├── RecordBadge.tsx        # Badge "NUEVO RECORD" con animación spring
    │   ├── GameCard.tsx           # Contenedor card reutilizable
    │   └── ConfirmModal.tsx       # Modal de confirmación genérico
    └── screens/
        ├── HomeScreen.tsx         # Inicio, navegación, toggle de tema
        ├── ConfigScreen.tsx       # Configuración de partida
        ├── GameScreen.tsx         # Lógica y UI del juego
        ├── ResultsScreen.tsx      # Resultado post-ronda
        ├── HistoryScreen.tsx      # Historial con filtros
        └── StatsScreen.tsx        # Estadísticas agregadas
```

## Instalación

```bash
cd calculosMentales
npm install
```

## Correr la app

```bash
# Servidor de desarrollo — escanear QR con Expo Go
npx expo start

# Android (emulador o dispositivo físico con USB)
npm run android

# iOS (requiere macOS y Xcode)
npm run ios

# Web (funcionalidad limitada sin APIs nativas)
npm run web
```

## Requisitos

- Node.js 18+
- [Expo Go](https://expo.dev/go) instalado en el dispositivo para probar sin compilar
- Android Studio (para emulador Android) o Xcode (para simulador iOS)

## Modos de juego

| Modo | Descripción |
|------|-------------|
| Clásico | Ingreso numérico con teclado custom en pantalla |
| Verdadero / Falso | Verificar si la ecuación mostrada es correcta o no |
| Múltiple Choice | Elegir la respuesta correcta entre 4 opciones (grid 2×2) |
| Contra Reloj | Responder la mayor cantidad posible antes de que expire el tiempo global |

## Dificultades

| Dificultad | Operaciones | Rango | Tiempo máx/op |
|------------|-------------|-------|---------------|
| Fácil | + − | 1–20 | 10 s |
| Medio | + − × | 1–50 (× hasta 12) | 8 s |
| Difícil | + − × ÷ | 1–100 (÷ exacta) | 6 s |

## Sistema de puntaje

| Resultado | Puntos |
|-----------|--------|
| Correcta rápida (< 75 % del tiempo máximo) | +100 |
| Correcta en tiempo (75–100 %) | +70 |
| Incorrecta | −30 |
| Sin respuesta (timeout) | −50 |

El puntaje final puede ser negativo.

## Sonidos

Los archivos de audio se cargan una sola vez al iniciar la app (`soundManager.init()` en `App.tsx`). Pueden desactivarse con el toggle **Sonido** en la pantalla de configuración.

| Evento | Archivo |
|--------|---------|
| Inicio de la app | `mixkit-intro-transition-1146.wav` |
| Puntaje negativo al terminar | `mixkit-retro-game-notification-212.wav` |
| Toque de botón / tecla | `button-click.wav` (generado programáticamente) |
| Respuesta correcta / incorrecta / timeout / fin de ronda | (enchufar archivos en `soundManager.ts`) |
