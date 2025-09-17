
// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Registro de usuario (sin password)
router.post("/register", async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "username y email son obligatorios" });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Crear usuario (sin campo password)
    const newUser = new User({ username, email });
    await newUser.save();

    return res.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en /register:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Login de usuario (sin password)
router.post("/login", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email es obligatorio" });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // (Opcional) si quieres verificar también username, descomenta:
    // if (username && username !== user.username) {
    //   return res.status(400).json({ error: "Datos de acceso inválidos" });
    // }

    // Generar token (JWT)
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "clave-secreta",
      { expiresIn: "1h" }
    );

    return res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("Error en /login:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
