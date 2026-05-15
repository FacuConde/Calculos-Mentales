# Decisiones de diseño — Cálculo Mental

## Funcionalidades implementadas

### Obligatorias (todas implementadas)

- **4 modos de juego:** Clásico (teclado custom), Verdadero/Falso, Múltiple Choice (grid 2×2), Contra Reloj (timer global configurable).
- **3 niveles de dificultad** con rangos de operandos, operadores y tiempos máximos diferenciados, centralizados en `constants/difficulty.ts`.
- **Timer por operación** (`useTimer`) con barra visual que cambia de verde → amarillo → rojo según el tiempo restante. Al agotarse, cuenta como timeout (−50 pts).
- **Sistema de puntaje exacto:** +100 (rápida), +70 (en tiempo), −30 (incorrecta), −50 (timeout).
- **Teclado numérico custom** (0–9, borrar, toggle de signo negativo, confirmar). Sin teclado nativo.
- **Persistencia local** con AsyncStorage: historial (máx. 50 partidas, FIFO), récords por combinación modo+dificultad, preferencias de usuario.
- **Pantalla de resultados** con puntaje animado (contador hacia arriba), stats detalladas y badge animado de nuevo récord.
- **Historial** con filtros por modo y dificultad, y borrado con confirmación.
- **Estadísticas agregadas** por modo: partidas jugadas, mejor puntaje, precisión media.
- **Tema oscuro/claro** con toggle en Home, persiste entre sesiones.
- **"Terminar al primer error"** configurable en modo Contra Reloj.

### Opcionales implementados

- **Animaciones:** fade-in por operación (`OperationDisplay`), spring en `RecordBadge`, contador animado en `AnimatedScore`, escala en `AnimatedScore` al montar.
- **Feedback visual inmediato:** borde verde/rojo en `GameScreen` durante 300 ms tras cada respuesta.
- **Sonidos** (`expo-av`):
  - Intro al primer lanzamiento de la app.
  - Derrota (puntaje negativo) al terminar una ronda.
  - Click en todos los botones de navegación y en cada tecla del teclado custom.
  - Arquitectura preparada para correct/incorrect/timeout/finish con archivos propios.

### Opcionales no implementados

- **Gráficos en estadísticas** (`react-native-chart-kit`): no se instaló para no agregar peso innecesario y porque las estadísticas textuales son suficientes para el TP.
- **Dificultad dinámica** (reducción del tiempo por racha correcta): descartado por complejidad de UX en el tiempo disponible.
---

## Decisiones de diseño

### Separación de contextos

`SettingsContext` y `GameContext` son contextos independientes con ciclos de vida distintos. Las settings persisten automáticamente en cada cambio (efecto en el reducer); el estado de partida se carga una sola vez desde AsyncStorage al montar `GameProvider`. Mezclarlos en un único contexto hubiera forzado re-renders innecesarios al cambiar configuraciones durante el juego.

### `useGameLogic` como orquestador

Toda la lógica de ronda (timer por operación, generación de ops, acumulación de resultados, detección de fin, timer global en Contra Reloj) vive en el hook `useGameLogic`. `GameScreen` solo renderiza lo que el hook expone y delega los eventos del usuario. Esto mantiene el componente pequeño y permite probar la lógica de ronda en aislamiento.

### Singleton de sonidos (`soundManager`)

Los sonidos se cargan una única vez al iniciar la app (`App.tsx`) mediante un singleton de clase, en lugar de cargar/descargar en cada componente. Esto evita latencia audible en la primera reproducción y garantiza que el estado de carga no se pierda al navegar entre pantallas. El viejo `useSound` quedó como wrapper que delega al manager para no romper la interfaz existente en `GameScreen`.

### Teclado numérico custom

Se optó por un teclado propio (0–9, ⌫, −, Confirmar) para: (a) evitar los problemas de `KeyboardAvoidingView` en distintos dispositivos Android, (b) integrar el toggle de signo negativo en la misma UI, y (c) mantener control total sobre el diseño visual y el comportamiento táctil.

### Generación de operaciones sin decimales

- **División:** se genera el resultado primero, luego se multiplica por el divisor → el dividendo siempre es exactamente divisible.
- **Resta fácil/medio:** el sustraendo se elige en rango `[min, a]` para garantizar resultado ≥ 0.
- **Múltiple Choice:** distractores con delta ±1 a ±10 respecto al correcto, con fallback incremental si no se generan 3 únicos en 200 intentos.
- **V/F:** la elección correcto/incorrecto es `Math.random() < 0.5`; si se muestra incorrecto, se suma o resta un delta aleatorio 1–10 (nunca igual al resultado correcto).

### Chips de configuración

El bug original (`DURATION_OPTIONS as unknown as string[]`) convertía tipos solo en TypeScript pero no en runtime, haciendo que la comparación `selected === opt` comparara string con number (siempre `false`). La corrección fue usar `.map(String)` para convertir realmente los valores antes de pasarlos al componente genérico.

### Nueva arquitectura de Expo (newArchEnabled)

Se mantiene `newArchEnabled: true` (valor por defecto en Expo SDK 54). Esto requirió instalar las dependencias con `npx expo install` en lugar de `npm install` directo, ya que Expo resuelve versiones compatibles con la arquitectura activa (e.g. `react-native-screens ~4.16.0` en vez de `^4.25.0` que requería RN 0.82+).

---

## Problemas conocidos

- **Condición de carrera en Contra Reloj:** si el usuario toca una respuesta en el mismo tick en que expira el timer global (intervalo de 500 ms), ambos handlers pueden ejecutarse. En la práctica, el debounce natural del intervalo lo hace improbable en uso normal.
- **Puntaje recalculado en cada render:** `computeFinalScore(results)` se llama en el render de `GameScreen`. Para rondas de hasta 20 operaciones el costo es despreciable; en una iteración futura se podría memoizar.
- **Sonidos correcta/incorrecta/timeout/finish:** la infraestructura está lista en `soundManager.ts` y `useSound.ts`, pero los archivos de audio no están incluidos. Para activarlos: agregar los `.mp3`/`.wav` a `assets/` y descomentar las entradas en `SOURCES` dentro de `soundManager.ts`.
