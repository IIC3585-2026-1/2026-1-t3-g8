### Tarea 3 - grupo 8

Este repo consiste en una aplicación web de Sudoku que utiliza WebAssembly (WASM) para resolver el tablero. El solver está escrito en C y compilado a WASM con Emscripten. El frontend está construido con Next.js y React.

El código que resuelve el tablero `sudoku.c` fue extraído de [Sudoku in C - GeeksforGeeks](https://www.geeksforgeeks.org/c/sudoku-in-c/).

## Correr el proyecto (sin recompilar)

Los archivos `.wasm` y `.js` ya están compilados en `sudoku-web-app/public/wasm/`.

```bash
cd sudoku-web-app
npm install
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## Recompilar el solver (opcional)

Solo necesitas hacer esto si modificas `sudoku.c` o quieres cambiar las funciones o metodos de runtime exportados en el comando de compilación.

### 1. Instalar Emscripten

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

### 2. Compilar

Desde la raíz del repositorio (donde está `sudoku.c`):

```bash
emcc sudoku.c -o sudoku.js \
  -s EXPORTED_FUNCTIONS='["_solve_sudoku", "_malloc", "_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAP8","HEAP32"]' \
  -s ALLOW_MEMORY_GROWTH=1
```

Nota: este es el comando que se utilizó para compilar el sudoku.wasm actual, puede variar dependiendo de la configuración deseada.

**Explicación de los Flags**

| Flag | Motivo |
|---|---|
| `EXPORTED_FUNCTIONS` | Expone `_solve_sudoku`, `_malloc` y `_free` para llamarlos desde JavaScript |
| `EXPORTED_RUNTIME_METHODS` | Expone `HEAP8` y `HEAP32`, que son las vistas de memoria del WASM necesarias para leer y escribir el tablero |
| `ALLOW_MEMORY_GROWTH` | Permite que el heap de WASM crezca dinámicamente si es necesario |

### 3. Copiar los archivos generados

```bash
cp sudoku.js sudoku-web-app/public/wasm/
cp sudoku.wasm sudoku-web-app/public/wasm/
```

---

## Uso de IA

Se utilizó IA (Claude) como **asistente** de desarrollo a lo largo del proyecto. Algunas de las cosas para las que se utilizó:

- Corrección de bugs que iban apareciendo en la implementación de la página Web.
- Implementación de funciones que crean un tablero de sudoku inicial que sea válido para un juego.
- Estructura y diseño del tablero con celdas diferenciadas visualmente entre las originales y números resueltos, bordes gruesos para delimitar las subgrillas 3×3, y animación de confetti al resolver.


---

## Autoevaluación

La IA ayudó a avanzar más rápido, especialmente para corregir bugs y proponer una base para generar tableros válidos. Sin embargo, no todas las respuestas eran suficientes por sí solas y fue necesario revisarlas para una correcta implementación.

Detectamos dos limitaciones importantes:
- Aceptar soluciones sin entenderlas completamente: algunas funcionaban, pero podían dejar código más difícil de entender.
- Implementación deficiente: en la generación de código, no todo lo generado funcionaba correctamente en primera instancia, y era necesario validar los cambios e iterar.

Para mejorar proponemos:
- Aplicar una regla de que quien integra un cambio debe poder explicarlo.
- Exigir pruebas mínimas por el equipo para todo cambio sugerido por IA en futuras tareas.

En conclusión, la IA fue un buen apoyo para acelerar el trabajo, pero su uso debe ir siempre acompañado de una revisión crítica y validación.