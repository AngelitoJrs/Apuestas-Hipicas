const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Este es el código de ejemplo que viene por defecto.
// Por ahora no afecta a tu página web de apuestas.

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hola desde los logs de Firebase!", {structuredData: true});
  response.send("El servidor de funciones está activo.");
});