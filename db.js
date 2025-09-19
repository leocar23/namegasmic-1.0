// db.js
const mongoose = require("mongoose");
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  // Evita crashear si no está configurado (útil en staging/local)
  if (!uri) {
    console.warn("⚠️  MONGODB_URI no está definida. Saltando conexión a MongoDB.");
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000, // evita colgarse mucho tiempo si no conecta
    });
    console.log(`✅ MongoDB conectado: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    // En producción puedes querer salir para que el orquestador reinicie
    if (process.env.NODE_ENV === "production") process.exit(1);
  }
}
module.exports = connectDB;



