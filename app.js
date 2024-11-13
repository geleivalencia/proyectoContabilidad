const express = require("express");
const mysql = require("mysql2");
const { it } = require("node:test");

const app = express();
const port = 3000;
app.use(express.json());

// Configura la conexión a MySQL
const db = mysql.createConnection({
    host: "autorack.proxy.rlwy.net",
    user: "root",
    password: "xzaitKcVUmUZSqFOWNgIsguvxPMohDTb",
    database: "railway",
    port: "22245"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Conectado a MySQL");
});

// Crea un endpoint que retorna datos
app.get("/sales", (req, res) => {
    db.query("SELECT * FROM ventas", (err, result) => {
        if (err) throw err;
        const datosTransformados = result.map(item => ({
            ...item,
            anio: item.año
        }));
        datosTransformados.forEach(it => delete it.año)
        res.json(datosTransformados);
    });
});

// Endpoint POST
app.post('/sales', (req, res) => {
    // Extrae los datos del body de la solicitud
   const {data, prediction} = req.body;
   // Procesar los datos (en este caso, se imprimen en consola)
   console.log('Datos recibidos:', { data });
   
    if (!prediction) {
        const sql = `INSERT INTO prediccion(ventas) VALUES (?)`;
        db.query(sql, [data.prediction], (err, result) => {
            if (err) {
                deleteAll();
                return res.status(500).json({ title: "¡Oh no!", message: 'Ocurrió un error al guardar tus datos.' });
            }
        });
    }

    data.forEach(it => {
        const mes = it.mes
        const anio = it.anio
        const valor = it.valor

        // Validación básica de los datos
        if (!mes || !anio || !valor) {
            deleteAll();
            return res.status(400).json({ title: "¡Te faltan datos!", message: 'Parece que has olvidado llenar ciertos campos.' });
        }

        // Procesar los datos (en este caso, se imprimen en consola)
        console.log('Datos recibidos:', { mes, anio, valor });

        const sql = `INSERT INTO ventas(mes, año, valor) VALUES (?, ?, ?)`;
        db.query(sql, [mes, anio, valor], (err, result) => {
            if (err) {
                deleteAll();
                return res.status(500).json({ title: "¡Oh no!", message: 'Ocurrió un error al guardar tus datos.' });
            }
        });
    })
    // Enviar respuesta
    res.status(200).json({ title: "¡Genial!", message: 'Tus datos se han cargado correctamente.' });
});

// Crea un endpoint que retorna datos
app.delete("/delete", (req, res) => {
    if (deleteAll()) {
        res.status(200);
    } else {
        res.status(500).json({ title: "¡Oh no!", message: 'Ocurrió un error inesperado.' });
    }
});

function deleteAll() {
    db.query("TRUNCATE TABLE ventas", (err, result) => {
        if (err) {
            return false;
        }
    });
    db.query("TRUNCATE TABLE prediccion", (err, result) => {
        if (err) {
            return false;
        }
    });
    return true;
}


app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor en ejecución en http://0.0.0.0:${port}`);
});