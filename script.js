// ============ DATOS REALES (verificados, periodo oct-2025 a ago-2026) ============

const comunas = {
  labels: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Otras'],
  venta: [2103705570, 1047664817, 393851210, 137034606, 48770850, 21623845],
  pct: [56.1, 27.9, 10.5, 3.7, 1.3, 0.6]
};

const comunasHeat = ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Camiña'];

const heatData = {
  'Evelin Muñoz':       [5641652, 518881631, 0, 0, 0, 0],
  'Gonzalo Echeverría': [637239078, 0, 0, 0, 0, 0],
  'Yhovanka Cartagena': [64697645, 0, 393851210, 136900452, 48770850, 6276936],
  'Danilo Baros':       [3885036, 526588740, 0, 0, 0, 0],
  'Francisco Montero':  [630223700, 0, 0, 0, 0, 0],
  'Alexis Inostroza':   [734118528, 0, 0, 0, 0, 0],
  'Guillermo Frez':     [3612134, 0, 0, 0, 0, 0]
};

const clientesClave = [
  { nombre: 'Sociedad Comercial Time Market', tipo: 'Almacén (persona natural)', comuna: 'Iquique', venta: 39534640, cajas: 2326, pct: 1.05 },
  { nombre: 'Soc. Com. Contreras Ltda', tipo: 'Almacén', comuna: 'Iquique', venta: 28253957, cajas: 1784, pct: 0.75 },
  { nombre: 'Alvarez Eusebio Gladis Jaquelin', tipo: 'Almacén (sin más datos)', comuna: 'Iquique', venta: 27127173, cajas: 2191, pct: 0.72 },
  { nombre: 'Ururi Laura Celia Nely', tipo: 'Almacén (persona natural)', comuna: 'Iquique', venta: 25263355, cajas: 1495, pct: 0.67 },
  { nombre: 'Administradora de Ventas al Detalle', tipo: 'Pronto Copec C-Store', comuna: 'Pozo Almonte', venta: 22726931, cajas: 1165, pct: 0.60 }
];

// Compras totales de clientes CON maquina, por comuna (no promedio por maquina)
const maquinas = {
  labels: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'María Elena', 'Camiña'],
  compras: [2705663601, 1120885020, 381960524, 218201989, 12730341, 9280658, 5389774],
  nMaquinas: [984, 711, 162, 70, 8, 1, 9]
};

// Comunas con coordenadas reales, para el mapa (verificadas, filtradas: sin clientes de compra unica)
const mapaComunas = [
  { nombre: 'Iquique',        lat: -20.2439, lng: -70.1389, venta: 2103705570 },
  { nombre: 'Alto Hospicio',  lat: -20.2569, lng: -70.0219, venta: 1047664817 },
  { nombre: 'Pozo Almonte',   lat: -20.2908, lng: -69.6958, venta: 393851210 },
  { nombre: 'Pica',           lat: -20.4931, lng: -69.3269, venta: 137034606 },
  { nombre: 'Huara',          lat: -19.8089, lng: -69.9719, venta: 48770850 },
  { nombre: 'Camiña',         lat: -20.4828, lng: -69.3669, venta: 6276936 },
  { nombre: 'María Elena',    lat: -22.3451, lng: -69.6615, venta: 6528455 },
  { nombre: 'Las Condes',     lat: -33.4089, lng: -70.5693, venta: 6511690 },
  { nombre: 'Talca',          lat: -35.4264, lng: -71.6554, venta: 2306764 }
];

// ============ FORMATO ============
function clpFmt(v) {
  return '$' + Math.round(v).toLocaleString('es-CL');
}
function clpCompacto(v) {
  return '$' + (v / 1e6).toFixed(1) + 'M';
}

// ============ ESTILO GLOBAL DE CHART.JS ============
Chart.defaults.color = '#8fa1ae';
Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.tooltip.backgroundColor = '#16324a';
Chart.defaults.plugins.tooltip.titleColor = '#efe9dd';
Chart.defaults.plugins.tooltip.bodyColor = '#c9a876';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(239,233,221,0.15)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 4;
const gridColor = 'rgba(239,233,221,0.07)';

// ============ HEATMAP (comuna x vendedor) ============
function colorFor(value, max) {
  if (value === 0) return 'rgba(239,233,221,0.04)';
  const t = Math.pow(value / max, 0.35); // escala log-like para que valores chicos igual se vean
  const lo = [22, 50, 74];   // --heat-lo #16324a
  const hi = [201, 168, 118]; // --heat-hi #c9a876
  const rgb = lo.map((c, i) => Math.round(c + (hi[i] - c) * t));
  return `rgb(${rgb.join(',')})`;
}

function buildHeatmap() {
  const container = document.getElementById('heatmap');
  const maxVal = Math.max(...Object.values(heatData).flat());

  // fila de encabezados: ahora son las comunas (solo 6, se leen normales sin rotar)
  const headerRow = document.createElement('div');
  headerRow.className = 'heat-row';
  headerRow.innerHTML = '<div></div>' + comunasHeat.map(c => `<div class="heat-head-h">${c}</div>`).join('');
  container.appendChild(headerRow);

  Object.entries(heatData).forEach(([vendedor, valores]) => {
    const maxDeLaFila = Math.max(...valores);
    const row = document.createElement('div');
    row.className = 'heat-row';
    let html = `<div class="heat-rowlabel">${vendedor}</div>`;
    valores.forEach((v, i) => {
      const esMax = v > 0 && v === maxDeLaFila;
      html += `<div class="heat-cell ${esMax ? 'heat-cell-max' : ''}" style="background:${colorFor(v, maxVal)}">
                 <span class="heat-tip">${comunasHeat[i]}: ${v > 0 ? clpCompacto(v) : 'sin venta'}</span>
               </div>`;
    });
    row.innerHTML = html;
    container.appendChild(row);
  });
}
buildHeatmap();

// ============ GRAFICO COMUNAS (toggle donut / bar) ============
let chartComunasInstance = null;

function renderChartComunas(tipo) {
  if (chartComunasInstance) chartComunasInstance.destroy();
  const ctx = document.getElementById('chartComunas');

  if (tipo === 'donut') {
    chartComunasInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: comunas.labels,
        datasets: [{
          data: comunas.pct,
          backgroundColor: ['#c9a876', '#5fa79a', '#3d6e66', '#8fa1ae', '#16324a', '#12283a'],
          borderColor: '#0c1b26',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}%` } }
        }
      }
    });
  } else {
    chartComunasInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: comunas.labels,
        datasets: [{
          data: comunas.venta,
          backgroundColor: '#5fa79a',
          borderRadius: 3,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => clpFmt(c.raw) } }
        },
        scales: {
          y: { grid: { color: gridColor }, ticks: { callback: v => '$' + (v/1e6).toFixed(0) + 'M' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
renderChartComunas('donut');

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderChartComunas(btn.dataset.chart);
  });
});

// ============ TARJETAS DE CLIENTES CLAVE ============
const clientContainer = document.getElementById('clientCards');
clientesClave.forEach((c, i) => {
  const div = document.createElement('div');
  div.className = 'client-card';
  div.innerHTML = `
    <div class="rank">N° ${i + 1}</div>
    <div class="cname">${c.nombre}</div>
    <div class="cval">${clpCompacto(c.venta)}</div>
    <div class="cmeta">${c.tipo}</div>
    <div class="cmeta">${c.comuna} · ${c.cajas.toLocaleString('es-CL')} cajas · ${c.pct}% del total</div>
  `;
  clientContainer.appendChild(div);
});

// ============ GRAFICO: COMPRAS POR ZONA CON MAQUINA (no promedio) ============
new Chart(document.getElementById('chartMaquinas'), {
  type: 'bar',
  data: {
    labels: maquinas.labels,
    datasets: [{
      label: 'Compras totales',
      data: maquinas.compras,
      backgroundColor: maquinas.labels.map((_, i) => i === 0 ? '#c9a876' : '#5fa79a'),
      borderRadius: 3,
      maxBarThickness: 50
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => clpFmt(c.raw) + ' en compras',
          afterLabel: (c) => `${maquinas.nMaquinas[c.dataIndex]} máquinas instaladas`
        }
      }
    },
    scales: {
      y: { grid: { color: gridColor }, ticks: { callback: v => '$' + (v/1e6).toFixed(0) + 'M' } },
      x: { grid: { display: false } }
    }
  }
});

// ============ MAPA REAL (Leaflet + OpenStreetMap, sin costo/API key) ============
const mapa = L.map('mapaReal', { scrollWheelZoom: false }).setView([-24, -70], 4);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  maxZoom: 12,
  subdomains: 'abcd'
}).addTo(mapa);

const maxVentaMapa = Math.max(...mapaComunas.map(c => c.venta));

mapaComunas.forEach(c => {
  const radio = 6 + Math.sqrt(c.venta / maxVentaMapa) * 34;
  const color = c.venta > maxVentaMapa * 0.1 ? '#c9a876' : '#5fa79a';
  L.circleMarker([c.lat, c.lng], {
    radius: radio,
    fillColor: color,
    color: color,
    weight: 1,
    fillOpacity: 0.45
  })
  .addTo(mapa)
  .bindPopup(`<b>${c.nombre}</b><br>${clpFmt(c.venta)} en venta`);
});

// ============ ANIMACION AL HACER SCROLL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
