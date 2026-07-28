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
import cors from 'cors'

const app = express()
const PORT = 3000

app.use(cors({ methods: ['GET', 'POST', 'PUT'] }));
app.use(express.json())

//Rutas selecciones
app.get('/api/selecciones', (req, res) => {
    // Filtrar por contienente
    const continente = req.query.continente
    if (continente) {
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

// Rutas estadisticas

app.get('/api/estadisticas', (req, res) => {

    const seleccionesPorContinente = selecciones.reduce((acc, s) => {

        const continente = continentes.find(
            c => c.id === s.continenteId
        ).nombre;

        acc[continente] = (acc[continente] || 0) + 1;

        return acc;

    }, {});

    const promedioRanking =
        selecciones.reduce(
            (acc, s) => acc + s.fifaRanking,
            0
        ) / selecciones.length;

    const estadisticas = {

        totalSelecciones: selecciones.length,

        totalCopas: selecciones.reduce(
            (acc, s) => acc + s.copas.length,
            0
        ),

        seleccionesPorContinente,

        promedioRanking

    };

    res.json(estadisticas);

});
// Rutas semifinales y final

app.post('/api/worldcup/2026/semifinals/:n', (req, res) => {
    const n = Number(req.params.n);
    const body = req.body;
    if (n > 4 || n < 1) {
        return res.status(400).json({ error: 'Número de semifinal inválido' })
    }
    if (body.goles1 < 0 || body.goles2 < 0) {
        return res.status(400).json({ error: 'Los goles no pueden ser negativos' })
    }
    if (body.seleccion1 === body.seleccion2) {
        return res.status(400).json({ error: 'No se puede registrar un partido entre la misma selección' })
    }
    const seleccion1 = selecciones.find(s => s.id === body.seleccion1)
    const seleccion2 = selecciones.find(s => s.id === body.seleccion2)
    if (!seleccion1 || !seleccion2) {
        return res.status(404).json({ error: 'Una o ambas selecciones no encontradas' })
    }

    const semifinales = {
        numero: n,
        local: {
            seleccionId: body.seleccion1,
            goles: body.goles1
        },
        visita: {
            seleccionId: body.seleccion2,
            goles: body.goles2
        }
    }

    partidos.semifinales.push(semifinales)
    res.status(201).json({ message: 'Semifinal registrada', semifinales })  

})

app.get('/api/worldcup/2026/semifinals/:n', (req, res) => {
    const n = Number(req.params.n);
    const semifinal = partidos.semifinales.find(s => s.numero === n)
    if (!semifinal) {
        return res.status(404).json({ error: 'Semifinal no encontrada' })
    }
    const local = selecciones.find(
        s => s.id === semifinal.local.seleccionId
    );

    const visita = selecciones.find(
        s => s.id === semifinal.visita.seleccionId
    );

    let ganador;

    if (semifinal.local.goles > semifinal.visita.goles) {
        ganador = local.nombre;
    }
    else if (semifinal.visita.goles > semifinal.local.goles) {
        ganador = visita.nombre;
    }
    else {
        ganador = "Empate";
    }
    res.json({
        "partido": "semifinal " + n,
        "local": { "Selección: ": local.nombre, "Goles: ": semifinal.local.goles },
        "visita": { "Selección: ": visita.nombre, "Goles: ": semifinal.visita.goles },
        "ganador": ganador
    })
})

app.get('/api/worldcup/2026/semifinals', (req, res) => {

    const resultado = [];

    for (let i = 1; i <= 4; i++) {
        let ganador;
        const semifinal = partidos.semifinales.find(
            s => s.numero === i
        );
        if (semifinal) {

            const local = selecciones.find(
                s => s.id === semifinal.local.seleccionId
            );
            const visita = selecciones.find(
                s => s.id === semifinal.visita.seleccionId
            );
            if (semifinal.local.goles > semifinal.visita.goles) {
                ganador = local.nombre;
            }
            else if (semifinal.visita.goles > semifinal.local.goles) {
                ganador = visita.nombre;
            }
            else {
                ganador = "Empate";
            }

            resultado.push({
                "partido": "semifinal " + semifinal.numero,
                "local": { "Selección: ": local.nombre, "Goles: ": semifinal.local.goles },
                "visita": { "Selección: ": visita.nombre, "Goles: ": semifinal.visita.goles },
                "ganador": ganador
            });

        } else {
            resultado.push({
                "partido": "Semifinal: " + i,
                "local": null,
                "visita": null,
                "ganador": null
            });
        }
    }

    res.json(resultado);
})

app.post('/api/worldcup/2026/final', (req, res) => {
    const body = req.body;
    if (body.goles1 < 0 || body.goles2 < 0) {
        return res.status(400).json({ error: 'Los goles no pueden ser negativos' })
    }
    if (body.seleccion1 === body.seleccion2) {
        return res.status(400).json({ error: 'No se puede registrar un partido entre la misma selección' })
    }
    const seleccion1 = selecciones.find(s => s.id === body.seleccion1)
    const seleccion2 = selecciones.find(s => s.id === body.seleccion2)
    if (!seleccion1 || !seleccion2) {
        return res.status(404).json({ error: 'Una o ambas selecciones no encontradas' })
    }
    if (partidos.final) {
        return res.status(400).json({
            error: "La final ya fue registrada"
        });
    }
    const final = {
        partido: "final",
        local: {
            seleccionId: body.seleccion1,
            goles: body.goles1
        },
        visita: {
            seleccionId: body.seleccion2,
            goles: body.goles2
        }
    }

    partidos.final = final;
    res.status(201).json({ message: 'Final registrada', final })
})

app.get('/api/worldcup/2026/final', (req, res) => {

    let ganador;
    if (!partidos.final) {
        return res.status(404).json({
            error: "La final aún no se ha jugado"
        });
    }

    const final = partidos.final;
    const local = selecciones.find(
        s => s.id === final.local.seleccionId
    );
    const visita = selecciones.find(
        s => s.id === final.visita.seleccionId
    );
    if (final.local.goles > final.visita.goles) {
        ganador = local.nombre;
    }
    else if (final.visita.goles > final.local.goles) {
        ganador = visita.nombre;
    }
    else {
        ganador = "Empate";
    }

    partidos.final = ({
        "partido": "final ",
        "local": { "Selección: ": local.nombre, "Goles: ": final.local.goles },
        "visita": { "Selección: ": visita.nombre, "Goles: ": final.visita.goles },
        "ganador": ganador
    });
    res.json(partidos.final);
})

app.listen(PORT, () => {
    console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
})


