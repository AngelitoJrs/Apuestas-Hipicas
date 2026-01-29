import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, addDoc, setDoc, doc, deleteDoc, updateDoc, serverTimestamp, 
    query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ADMIN_EMAIL = "gonzalezgamez70@gmail.com"; 

// --- 1. FUNCIONES GLOBALES ---

window.logout = () => signOut(auth).then(() => window.location.href = "auth.html");

window.enviarSolicitud = async (e) => {
    e.preventDefault();
    try {
        const datos = {
            nombre: document.getElementById('req-nombre').value.toUpperCase(),
            caballos: [
                parseInt(document.getElementById('rc1').value) || 0,
                parseInt(document.getElementById('rc2').value) || 0,
                parseInt(document.getElementById('rc3').value) || 0,
                parseInt(document.getElementById('rc4').value) || 0,
                parseInt(document.getElementById('rc5').value) || 0,
                parseInt(document.getElementById('rc6').value) || 0
            ],
            fecha_solicitud: serverTimestamp()
        };
        await addDoc(collection(db, "solicitudes"), datos);
        alert("¡Jugada enviada al comisario!");
        e.target.reset();
    } catch (error) { alert("Error al enviar solicitud"); }
};

window.aprobarSolicitud = async (id, nombre, caballosStr) => {
    try {
        const caballos = JSON.parse(decodeURIComponent(caballosStr));
        const nuevo = {
            nombre: nombre,
            v1: { caballo: caballos[0], pts: 0 }, v2: { caballo: caballos[1], pts: 0 },
            v3: { caballo: caballos[2], pts: 0 }, v4: { caballo: caballos[3], pts: 0 },
            v5: { caballo: caballos[4], pts: 0 }, v6: { caballo: caballos[5], pts: 0 },
            total: 0, fecha_registro: serverTimestamp()
        };
        await addDoc(collection(db, "participantes"), nuevo);
        await deleteDoc(doc(db, "solicitudes", id));
        alert("Aprobado y en pista");
    } catch (error) { alert("Error al aprobar"); }
};

window.rechazarSolicitud = async (id) => {
    if (confirm("¿Rechazar jugada?")) await deleteDoc(doc(db, "solicitudes", id));
};

// CORRECCIÓN: Función de edición restaurada y protegida
window.prepararEdicion = (id, nombre, c1, p1, c2, p2, c3, p3, c4, p4, c5, p5, c6, p6) => {
    document.getElementById('nombre').value = nombre || "";
    document.getElementById('c1').value = c1 || 0; document.getElementById('p1').value = p1 || 0;
    document.getElementById('c2').value = c2 || 0; document.getElementById('p2').value = p2 || 0;
    document.getElementById('c3').value = c3 || 0; document.getElementById('p3').value = p3 || 0;
    document.getElementById('c4').value = c4 || 0; document.getElementById('p4').value = p4 || 0;
    document.getElementById('c5').value = c5 || 0; document.getElementById('p5').value = p5 || 0;
    document.getElementById('c6').value = c6 || 0; document.getElementById('p6').value = p6 || 0;
    
    document.getElementById('admin-panel').dataset.editId = id;
    document.getElementById('btn-submit').innerText = "ACTUALIZAR DATOS";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.registrarParticipante = async (e) => {
    e.preventDefault();
    const adminPanel = document.getElementById('admin-panel');
    const idEdicion = adminPanel.dataset.editId; // Aquí guardamos el ID cuando editamos
    
    const getVal = (id) => parseInt(document.getElementById(id).value) || 0;
    
    // Recogemos todos los valores del formulario (Caballos y Puntos manuales)
    const datos = {
        nombre: document.getElementById('nombre').value.toUpperCase(),
        v1: { caballo: getVal('c1'), pts: getVal('p1') },
        v2: { caballo: getVal('c2'), pts: getVal('p2') },
        v3: { caballo: getVal('c3'), pts: getVal('p3') },
        v4: { caballo: getVal('c4'), pts: getVal('p4') },
        v5: { caballo: getVal('c5'), pts: getVal('p5') },
        v6: { caballo: getVal('c6'), pts: getVal('p6') },
        total: getVal('p1') + getVal('p2') + getVal('p3') + getVal('p4') + getVal('p5') + getVal('p6')
    };

    try {
        if (idEdicion && idEdicion !== "") {
            // MODO EDICIÓN: Actualiza el documento existente
            const docRef = doc(db, "participantes", idEdicion);
            await updateDoc(docRef, datos);
            
            // Limpiamos el modo edición
            delete adminPanel.dataset.editId;
            document.getElementById('btn-submit').innerText = "INGRESAR PARTICIPANTE";
            alert("✅ Datos actualizados correctamente");
        } else {
            // MODO NUEVO: Crea un documento nuevo
            datos.fecha_registro = serverTimestamp();
            await addDoc(collection(db, "participantes"), datos);
            alert("✅ Participante creado con éxito");
        }
        
        e.target.reset(); // Limpia el formulario
    } catch (error) { 
        console.error("Error al guardar:", error);
        alert("❌ Error al guardar en Firebase: " + error.message); 
    }
};

window.eliminarParticipante = async (id) => {
    if (confirm("¿Seguro que deseas eliminar a este participante?")) await deleteDoc(doc(db, "participantes", id));
};

window.guardarResultados = async (e) => {
    e.preventDefault();
    try {
        const leerV = (n) => [
            parseInt(document.getElementById(`res-v${n}-1`).value) || 0,
            parseInt(document.getElementById(`res-v${n}-2`).value) || 0,
            parseInt(document.getElementById(`res-v${n}-3`).value) || 0
        ];

        const datosPizarra = {
            v1: leerV(1), v2: leerV(2), v3: leerV(3),
            v4: leerV(4), v5: leerV(5), v6: leerV(6),
            ultima_actualizacion: serverTimestamp()
        };
        await setDoc(doc(db, "resultados", "oficial"), datosPizarra, { merge: true });
        alert("✅ Pizarra actualizada");
    } catch (error) { alert("❌ Error: " + error.message); }
};

function calcularPuntosDinamicos(caballoElegido, podio) {
    if (!podio || !caballoElegido || caballoElegido === 0) return 0;
    if (podio[0] !== 0 && caballoElegido === podio[0]) return 5;
    if (podio[1] !== 0 && caballoElegido === podio[1]) return 3;
    if (podio[2] !== 0 && caballoElegido === podio[2]) return 1;
    return 0;
}

// --- 2. ESCUCHADORES EN TIEMPO REAL ---

function iniciarEscuchas(isAdmin) {
    let pizarraOficial = { v1:[0,0,0], v2:[0,0,0], v3:[0,0,0], v4:[0,0,0], v5:[0,0,0], v6:[0,0,0] };

    onSnapshot(doc(db, "resultados", "oficial"), (docSnap) => {
        if (docSnap.exists()) {
            pizarraOficial = docSnap.data();
            if (isAdmin) {
                for (let i = 1; i <= 6; i++) {
                    const v = pizarraOficial[`v${i}`] || [0,0,0];
                    if(document.getElementById(`res-v${i}-1`)) document.getElementById(`res-v${i}-1`).value = v[0] || "";
                    if(document.getElementById(`res-v${i}-2`)) document.getElementById(`res-v${i}-2`).value = v[1] || "";
                    if(document.getElementById(`res-v${i}-3`)) document.getElementById(`res-v${i}-3`).value = v[2] || "";
                }
            }
        }

        const qTable = query(collection(db, "participantes"), orderBy("fecha_registro", "asc"));
        onSnapshot(qTable, (snapshot) => {
            const body = document.getElementById('tabla-body');
            if (!body) return;
            body.innerHTML = "";
            let i = 1;

            snapshot.forEach(docSnap => {
                const p = docSnap.data();
                const id = docSnap.id;

                const pts1 = calcularPuntosDinamicos(p.v1?.caballo, pizarraOficial.v1);
                const pts2 = calcularPuntosDinamicos(p.v2?.caballo, pizarraOficial.v2);
                const pts3 = calcularPuntosDinamicos(p.v3?.caballo, pizarraOficial.v3);
                const pts4 = calcularPuntosDinamicos(p.v4?.caballo, pizarraOficial.v4);
                const pts5 = calcularPuntosDinamicos(p.v5?.caballo, pizarraOficial.v5);
                const pts6 = calcularPuntosDinamicos(p.v6?.caballo, pizarraOficial.v6);
                const totalCalculado = pts1 + pts2 + pts3 + pts4 + pts5 + pts6;

                body.innerHTML += `
                    <tr class="text-center border-b border-gray-300">
                        <td class="p-2 border bg-gray-100">${i++}</td>
                        <td class="p-2 border text-left uppercase font-bold">${p.nombre}</td>
                        <td class="bg-green-500 text-white border">${p.v1?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts1}</td>
                        <td class="bg-yellow-400 border">${p.v2?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts2}</td>
                        <td class="bg-blue-500 text-white border">${p.v3?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts3}</td>
                        <td class="bg-orange-400 border">${p.v4?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts4}</td>
                        <td class="bg-red-500 text-white border">${p.v5?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts5}</td>
                        <td class="bg-purple-500 text-white border">${p.v6?.caballo || 0}</td><td class="text-red-600 border font-bold">${pts6}</td>
                        <td class="p-2 border bg-gray-800 text-white text-lg font-black">${totalCalculado}</td>
                        <td class="p-2 border ${isAdmin ? '' : 'hidden'}">
                            <div class="flex flex-col gap-1">
                                <button onclick="prepararEdicion('${id}', '${p.nombre}', ${p.v1?.caballo || 0}, ${pts1}, ${p.v2?.caballo || 0}, ${pts2}, ${p.v3?.caballo || 0}, ${pts3}, ${p.v4?.caballo || 0}, ${pts4}, ${p.v5?.caballo || 0}, ${pts5}, ${p.v6?.caballo || 0}, ${pts6})" class="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">Editar</button>
                                <button onclick="eliminarParticipante('${id}')" class="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">Eliminar</button>
                            </div>
                        </td>
                    </tr>`;
            });
        });
    });

    if (isAdmin) {
        onSnapshot(query(collection(db, "solicitudes"), orderBy("fecha_solicitud", "asc")), (snapshot) => {
            const lista = document.getElementById('lista-solicitudes');
            const panel = document.getElementById('pending-requests');
            if (!lista) return;
            panel.classList.toggle('hidden', snapshot.empty);
            lista.innerHTML = "";
            snapshot.forEach(docSnap => {
                const r = docSnap.data();
                const cabStr = encodeURIComponent(JSON.stringify(r.caballos));
                lista.innerHTML += `
                    <div class="flex justify-between items-center bg-white p-3 border-2 border-yellow-400 mb-2 rounded shadow-md">
                        <div>
                            <p class="font-black text-stone-800 uppercase text-sm">${r.nombre}</p>
                            <p class="text-[10px] font-bold text-blue-700">Caballos: ${r.caballos.join(" - ")}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="aprobarSolicitud('${docSnap.id}', '${r.nombre}', '${cabStr}')" class="bg-green-600 text-white px-3 py-1 rounded font-black text-[10px] uppercase">Aprobar</button>
                            <button onclick="rechazarSolicitud('${docSnap.id}')" class="bg-red-600 text-white px-3 py-1 rounded font-black text-[10px] uppercase">X</button>
                        </div>
                    </div>`;
            });
        });
    }
}

// --- 3. INICIO Y SEGURIDAD ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loading-screen")?.classList.add("hidden");
        document.getElementById("content-wrapper")?.classList.remove("hidden");
        const isAdmin = user.email === ADMIN_EMAIL;
        if (isAdmin) {
            document.getElementById("admin-panel")?.classList.remove("hidden");
            document.getElementById("panel-resultados")?.classList.remove("hidden");
            document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
        }
        iniciarEscuchas(isAdmin);
    } else {
        window.location.href = "auth.html";
    }
});