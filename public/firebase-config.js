import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaBABLFXFcQyyfXx_hVFjh7oZkqD3uTIw",
  authDomain: "caballosapuestas-f253b.firebaseapp.com",
  projectId: "caballosapuestas-f253b",
  storageBucket: "caballosapuestas-f253b.firebasestorage.app",
  messagingSenderId: "769221362337",
  appId: "1:769221362337:web:95f82f7e26af0cef3226e0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Función para enviar los datos de la polla
export async function guardarJugada(datos) {
  try {
    // Usamos addDoc para que el ID de documento sea AUTOMÁTICO
    const docRef = await addDoc(collection(db, "participantes"), datos);
    console.log("Guardado con ID: ", docRef.id);
  } catch (e) {
    console.error("Error: ", e);
  }
}
