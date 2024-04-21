import bodyParser from "body-parser";
import express from "express";
import mysql from "mysql";
import path, { dirname } from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const mysqlClient = mysql.createConnection({
  host: "",
  user: "remote_user",
  password: "strong_password",
  database: "pokemon",
});

mysqlClient.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "pages")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/pokemon", (req, res) => {
  const query = "SELECT * FROM pokemon";

  mysqlClient.query(query, (err, results) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res
        .status(500)
        .json({ error: "Error al obtener los datos de la tabla pokemon" });
      return;
    }

    res.json(results);
  });
});

app.use(bodyParser.json());

app.post("/pokemon", async (req, res) => {
  // gets name from the body json
  const name = req.body.name;

  try {
    const { default: fetch } = await import("node-fetch");
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();

    // Insert the pokemon into the database
    const query = `INSERT INTO pokemon (name, weight, id) VALUES (?, ?, ?)`;
    mysqlClient.query(
      query,
      [data.name, data.weight, data.id],
      (err, results) => {
        if (err) {
          // Throws http error if duplicate
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Pokemon already exists" });
          }

          // Generic if not
          return res
            .status(500)
            .json({ error: "Error al insertar el pokemon" });
        }

        // Send a success response
        res.json({ message: "Pokemon inserted successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error al insertar el pokemon" });
  }
});

app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000 🚀");
});
