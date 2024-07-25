const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const { hashPassword } = require("./src/authUtils");

const app = express();
const port = 3000;
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
// Middleware

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["cookie"];
  const token = authHeader && authHeader.split("=")[1]; // Assure que le token est passé comme "Bearer token"

  if (token == null) return res.status(401).send("Token required");

  jwt.verify(token, "secret-key", (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
};

// Middleware pour vérifier le rôle de l'utilisateur
const checkAdminRole = (req, res, next) => {
  const token = req.headers["cookie"]?.split("=")[1];
  if (!token) return res.status(403).send("Token manquant");

  jwt.verify(token, "secret-key", (err, decoded) => {
    if (err) return res.status(401).send("Token invalide");

    const sql = "SELECT id_role FROM users WHERE id = ?";
    db.query(sql, [decoded.id], (err, results) => {
      if (err) return res.status(500).send("Erreur serveur");
      if (results.length === 0)
        return res.status(404).send("Utilisateur non trouvé");

      const userRole = results[0].id_role;
      if (userRole !== 1) return res.status(403).send("Accès interdit"); // Rôle d'administrateur a id_role = 1

      next();
    });
  });
};

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "dev",
  password: "",
  database: "garage_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

// Routes
app.post("/api/signup", (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = hashPassword(password);
  const defaultRoleId = 2;

  const sql =
    "INSERT INTO users (lastname, firstname, email, password, id_role, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
  db.query(
    sql,
    [lastname, firstname, email, hashedPassword, defaultRoleId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }
      res.status(201).send("User registered");
    }
  );
});

app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send("Invalid password");
      return;
    }

    const token = jwt.sign({ id: user.id }, "secret-key", { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  });
});

app.post("/api/verify-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ valid: false });
  }

  jwt.verify(token, "secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).send({ valid: false });
    }
    res.status(200).send({ valid: true });
  });
});

// Route pour obtenir tous les utilisateurs avec leurs rôles
app.get("/api/users", checkAdminRole, (req, res) => {
  const sql = `
    SELECT u.id, u.lastname, u.firstname, u.email, r.name AS role, u.created_at
    FROM users u
    JOIN roles r ON u.id_role = r.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(results);
  });
});

// Route pour modifier un utilisateur
app.put("/api/users/:id", authenticateToken, (req, res) => {
  const { lastname, firstname, email, id_role } = req.body;
  const sql = `
    UPDATE users
    SET lastname = ?, firstname = ?, email = ?, id_role = ?
    WHERE id = ?
  `;
  db.query(
    sql,
    [lastname, firstname, email, id_role, req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).send("User updated");
    }
  );
});

app.delete("/api/users/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).send("User deleted");
  });
});

// Route pour obtenir tous les rôles
app.get("/api/roles", (req, res) => {
  const sql = "SELECT * FROM roles";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(results);
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

module.exports = app;
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
