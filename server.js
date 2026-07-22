// ─────────────────────────────────────────────────────────────────────────────
// Evaluación 1 · API del Mundial 2026
// Diplomado IPS · Módulo 3 — Backend y APIs REST
//
// Este es tu punto de partida. Los DATOS ya están (datos-mundial.js): el resto
// lo escribes tú.
//
// ANTES DE EMPEZAR — instala lo que necesites. Por ejemplo:
//     npm install express
//     npm install cors
//
// Para levantar el servidor:
//     npm run dev        (se reinicia solo al guardar)
// ─────────────────────────────────────────────────────────────────────────────



// TODO: importa express y crea tu app.
//
//   import express from 'express'
//   const app = express()
//
// Recuerda el middleware que hace falta para leer el cuerpo de los POST,
// y configura CORS (lo vas a necesitar para el video).


// ─────────────────────────────────────────────────────────────────────────────
// TUS RUTAS
//
// Este es el mapa de lo que tienes que construir. El detalle completo de cada
// una (qué recibe, qué devuelve, qué status) está en el enunciado: léelo.
//
//   ── Base ──────────────────────────────────────────────────────────────────
//   GET  /api/selecciones                     todas
//   GET  /api/selecciones/:id                 una, o 404
//
//   ── Con lógica ⭐ ──────────────────────────────────────────────────────────
//   GET  /api/selecciones?continente=Europa   filtra por continente  (anidada)
//   GET  /api/selecciones?campeon=true        solo las que ganaron alguna copa
//   GET  /api/copas                           todas las copas, en una lista plana
//   GET  /api/copas/:seleccion                las copas de una (por NOMBRE), o 404
//   GET  /api/estadisticas                    resumen del torneo         (vale 2%)
//
//   ── Semifinales y final ⭐ ─────────────────────────────────────────────────
//   POST /api/worldcup/2026/semifinals/:n     registra la semifinal n (1 a 4)
//   GET  /api/worldcup/2026/semifinals/:n     el resultado de la semifinal n
//   GET  /api/worldcup/2026/semifinals        las cuatro
//   POST /api/worldcup/2026/final             registra la final
//   GET  /api/worldcup/2026/final             la final, con su ganador
//
// Ojo: /semifinals/:n es UNA ruta, no cuatro.
// ─────────────────────────────────────────────────────────────────────────────

// Ejemplo para que veas el formato. Bórralo o quédatelo, como prefieras:
//
//   app.get('/api/selecciones', (req, res) => {
//     res.json(selecciones)
//   })
//
// A partir de aquí, es tuyo. 🚀

// TODO: levanta el servidor.
//
//   app.listen(PORT, () => {
//     console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
//   })
import { continentes, grupos, selecciones, partidos } from './datos-mundial.js'
import express from 'express'
const app = express()
const PORT = 3000
app.use(express.json())

//Rutas selecciones
app.get('/api/selecciones', (req, res) => {
    // Filtrar por contienente
    if (req.query.continente) {
        const continente = req.query.continente
        const continenteEncontrado = continentes.find(
            c => c.nombre.toLowerCase() === continente?.toLowerCase()
        );
        if (!continenteEncontrado) {
            return res.status(404).json({ error: 'Continente no encontrado' })
        }
        const seleccionesFiltradas = selecciones.filter(
            s => s.continenteId === continenteEncontrado.id
        );
        return res.json(seleccionesFiltradas);
    }
    // Filtrar por campeon
    const campeon = req.query.campeon
    if (campeon === 'true') {
        const seleccionesCampeonas = selecciones.filter(s => s.copas.length > 0);
        return res.json(seleccionesCampeonas);
    }
    res.json(selecciones)
})

app.get('/api/selecciones/:id', (req, res) => {
    const id = Number(req.params.id);
    const seleccion = selecciones.find(s => s.id === id)
    if (!seleccion) {
        return res.status(404).json({ error: 'Selección no encontrada' })
    }
    res.json(seleccion)
})

// Rutas copas
app.get('/api/copas', (req, res) => {
    const copas = selecciones.flatMap(s => s.copas)
    return res.json(copas)
})

app.get('/api/copas/:seleccion', (req, res) => {
    const nombreSeleccion = req.params.seleccion;
    const buscaEquipo = selecciones.find
        (s => s.nombre.toLowerCase() === nombreSeleccion?.toLowerCase()
        );
    if (!buscaEquipo) {
        return res.status(404).json({ error: 'Selección no encontrada' })
    }
    return res.json(buscaEquipo.copas)
}
)



app.listen(PORT, () => {
    console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
})


