import { auth } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Redirección si ya está logueado
onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace("index.html");
});

const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnText = document.getElementById("btn-text"); // Asegúrate que este ID existe en tu HTML
const errorMsg = document.getElementById("error-msg");

if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // REGLA DE ORO: Si el botón dice "Entrar", hacemos login. Si no, hacemos registro.
        // Importante: Que coincida exactamente con el texto de tu HTML
        const isLoginMode = btnText.innerText.toLowerCase().includes("entrar");

        errorMsg.classList.add("hidden");
        btnText.disabled = true;
        const textoOriginal = btnText.innerText;
        btnText.innerText = "PROCESANDO...";

        try {
            if (isLoginMode) {
                // INTENTO DE ENTRAR
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Login exitoso");
            } else {
                // INTENTO DE CREAR CUENTA NUEVA
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("Cuenta creada");
            }
        } catch (error) {
            btnText.disabled = false;
            btnText.innerText = textoOriginal;
            errorMsg.classList.remove("hidden");

            // Personalización de mensajes para que no te confundas
            if (error.code === 'auth/email-already-in-use') {
                errorMsg.innerText = "ESTE CORREO YA TIENE CUENTA. ¡DALE A INICIAR SESIÓN!";
            } else if (error.code === 'auth/invalid-credential') {
                errorMsg.innerText = "CORREO O CLAVE INCORRECTOS.";
            } else {
                errorMsg.innerText = "ERROR: " + error.message;
            }
        }
    });
}