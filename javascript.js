// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC2asz1ljoB875hRk_f5vtcfYWhshH1EEc",
    authDomain: "aeronautika-df537.firebaseapp.com",
    databaseURL: "https://aeronautika-df537-default-rtdb.firebaseio.com",
    projectId: "aeronautika-df537",
    storageBucket: "aeronautika-df537.appspot.com",
    messagingSenderId: "697638893395",
    appId: "1:697638893395:web:72de5c178c3ededd8dd3a6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referensi data dari Firebase
const SOGRef = ref(database, "data/SOG");
const COGRef = ref(database, "data/COG");
const PositionRef = ref(database, "data/Position");
const GeoRef = ref(database, "data/Geotag");
const SkorRef = ref(database, "data/Score");
const xRef = ref(database, "data/x");
const yRef = ref(database, "data/y");

let latestX = null;
let latestY = null;

// ====== SETUP CHART.JS ====== //
const ctx = document.getElementById('realtimePlot').getContext('2d');

// Gambar latar belakang peta
const backgroundImage = new Image();
backgroundImage.src = 'berkas foto/MAPA.png';
let imageLoaded = false;
backgroundImage.onload = () => { 
    imageLoaded = true; 
};

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Lintasan ASV',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            tension: 0,
            showLine: true,
        }]
    },
    options: {
        animation: { 
            duration: 0 
        },
        responsive: true,
        scales: {
            x: { 
                type: 'linear', 
                min: 0, max: 25, 
                beginAtZero: true 
            },
            y: { 
                min: 0, 
                max: 25, 
                beginAtZero: true 
            }
        },
        plugins: {
            legend: { display: false },
            beforeDraw: (chart) => {
                if (imageLoaded) {
                    const ctx = chart.ctx;
                    const area = chart.chartArea;
                    ctx.save();
                    ctx.drawImage(backgroundImage, area.left, area.top, area.width, area.height);
                    ctx.restore();
                }
            }
        }
    }
});

// ====== FUNGSI UPDATE CHART ====== //
function updateChart(x, y) {
    if (x !== null && y !== null) {
        chart.data.datasets[0].data.push({ x: x, y: y });
        chart.update();
    }
}

// ====== LISTENER DATA REALTIME ====== //
onValue(xRef, (snapshot) => {
    latestX = snapshot.val();
    updateChart(latestX, latestY);
});

onValue(yRef, (snapshot) => {
    latestY = snapshot.val();
    updateChart(latestX, latestY);
});

onValue(SOGRef, (snapshot) => {
    document.getElementById('SOG').innerHTML = snapshot.val() + " Knot";
});

onValue(COGRef, (snapshot) => {
    document.getElementById('COG').innerHTML = snapshot.val() + "&#176;";
});

onValue(PositionRef, (snapshot) => {
    document.getElementById('Position').innerHTML = snapshot.val();
});

onValue(GeoRef, (snapshot) => {
    document.getElementById('geot').innerHTML = snapshot.val();
});

onValue(SkorRef, (snapshot) => {
    document.getElementById('skor').innerHTML = snapshot.val();
});

// ====== MODAL IMAGE ====== //
var modal = document.createElement("div");
modal.id = "imageModal";
modal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <img id="modalImage" alt="Image Detail">
        <div id="caption"></div>
    </div>
`;
document.body.appendChild(modal);

const imgSurface = document.querySelector(".image__surface img");
const imgUnderwater = document.querySelector(".image__underwater img");
const modalImg = document.getElementById("modalImage");
const captionText = document.getElementById("caption");
const span = modal.querySelector(".close");

imgSurface.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}

imgUnderwater.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}

span.onclick = function() {
    modal.style.display = "none";
}
