const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = require("../server"); // Assurez-vous que le fichier exporte l'application Express

app.use(bodyParser.json());
app.use(cors());

// Tests pour la route de connexion
describe("POST /api/signin", () => {
  it("doit retourner un code 200 et un token valide", async () => {
    const response = await request(app).post("/api/signin").send({
      email: "email@email.fr",
      password: "Password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("doit retourner un code 401 pour mauvais identifiants", async () => {
    const response = await request(app).post("/api/signin").send({
      email: "email@email.fr",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });
});
