# ⚽ Evaluación 1 · API del Mundial 2026

> **Diplomado IPS · Módulo 3** — Backend y APIs REST
> Instituto Profesional San Sebastián

---
# Instrucciones de como levanar proyecto
Se deben instalar librerias 'express' y 'cors' utizando el comando npm install 
npm install express
npm install cors

# Informacion sobre puerto
El proyecto corre en el pureto 3000

# Enlace de video

https://www.youtube.com/watch?v=nA52aN_1Y8c

# Formado body de rutas
## /api/worldcup/2026/semifinals/:n

{
    "seleccion1": 1,
    "goles1": 1,
    "seleccion2": 1,
    "goles2": 1
}

## /api/worldcup/2026/final

{
    "seleccion1": 1,
    "goles1": 4,
    "seleccion2": 2,
    "goles2": 1
}