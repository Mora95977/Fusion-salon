document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("appointmentForm");
    const citasKey = "citasFusion";

    document.getElementById("closeNotice").onclick = () =>
        document.getElementById("holidayNotice").style.display = "none";

    const hourSelect = document.getElementById("hour");
    for (let i = 1; i <= 12; i++) {
        hourSelect.innerHTML += `<option>${i.toString().padStart(2, "0")}</option>`;
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const service = document.getElementById("service").value;
        const barber = document.getElementById("barber").value;
        const date = document.getElementById("date").value;
        const hour = document.getElementById("hour").value;
        const minute = document.getElementById("minute").value;
        const ampm = document.getElementById("ampm").value;
        const horaCompleta = `${hour}:${minute} ${ampm}`;

        const day = new Date(date).getDay();
        let minutos = parseInt(hour) % 12 * 60 + parseInt(minute);
        if (ampm === "PM") minutos += 720;

        if ((day >= 1 && day <= 4 && (minutos < 480 || minutos > 1110)) ||
            (day === 5 || day === 6) && (minutos < 480 || minutos > 1200) ||
            day === 0) {
            alert("Horario fuera de rango");
            return;
        }

        const citas = JSON.parse(localStorage.getItem(citasKey)) || [];
        if (citas.some(c => c.Fecha === date && c.Hora === horaCompleta && c.Barbero === barber)) {
            alert("Ese horario ya está reservado con este barbero.");
            return;
        }

        const nuevaCita = { Nombre: name, Servicio: service, Barbero: barber, Fecha: date, Hora: horaCompleta };
        citas.push(nuevaCita);
        localStorage.setItem(citasKey, JSON.stringify(citas));

        const mensaje = `Hola, quiero agendar una cita:\n👤 ${name}\n✂️ ${service}\n💈 ${barber}\n📅 ${date}\n🕒 ${horaCompleta}`;
        window.open(`https://api.whatsapp.com/send?phone=50684021824&text=${encodeURIComponent(mensaje)}`, "_blank");
        form.reset();
    };

    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") requestAdminAccess();
    });

    function requestAdminAccess() {
        const clave = prompt("Ingrese clave de administrador:");
        if (clave === "Pmyv1234") {
            document.getElementById("adminSection").style.display = "block";
            mostrarCitas();
        } else {
            alert("Clave incorrecta.");
        }
    }

    function mostrarCitas() {
        const tabla = document.querySelector("#citasTable tbody");
        tabla.innerHTML = "";
        const citas = JSON.parse(localStorage.getItem(citasKey)) || [];
        citas.forEach(c => {
            const fila = document.createElement("tr");
            fila.innerHTML = `<td>${c.Nombre}</td><td>${c.Servicio}</td><td>${c.Barbero}</td><td>${c.Fecha}</td><td>${c.Hora}</td>`;
            tabla.appendChild(fila);
        });
    }

    document.getElementById("btnExcel").onclick = () => {
        const citas = JSON.parse(localStorage.getItem(citasKey)) || [];
        if (!citas.length) return alert("No hay citas.");
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(citas);
        XLSX.utils.book_append_sheet(wb, ws, "Citas");
        XLSX.writeFile(wb, "CitasFusion.xlsx");
    };

    document.getElementById("btnBorrar").onclick = () => {
        if (confirm("¿Seguro que deseas borrar todas las citas?")) {
            localStorage.removeItem(citasKey);
            mostrarCitas();
            alert("Citas eliminadas.");
        }
    };
});
