// ============ DATOS REALES (verificados, periodo oct-2025 a ago-2026) ============

const comunas = {
  labels: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Otras'],
  venta: [2118857693, 1053280060, 396621493, 137992369, 50350785, 24408439],
  pct: [56.0, 27.9, 10.5, 3.6, 1.3, 0.6]
};

const vendedores = ['Evelin Muñoz', 'Gonzalo Echeverría', 'Yhovanka Cartagena', 'Danilo Baros', 'Francisco Montero', 'Alexis Inostroza', 'Guillermo Frez', 'Mauricio Sanhueza'];

const heatData = {
  'Iquique':        [5641652, 638992463, 65260381, 3885036, 632593794, 739954541, 3612134, 0],
  'Alto Hospicio':  [521382023, 0, 6747, 528732462, 0, 149739, 0, 0],
  'Pozo Almonte':   [0, 0, 396621493, 0, 0, 0, 0, 0],
  'Pica':           [0, 0, 137858215, 0, 0, 0, 0, 0],
  'Huara':          [0, 0, 50350785, 0, 0, 0, 0, 0],
  'Camiña':         [0, 0, 6276936, 0, 0, 0, 0, 0]
};

const clientesClave = [
  { nombre: 'Sociedad Comercial Time Market', comuna: 'Iquique', venta: 39534640, cajas: 2326, pct: 1.05 },
  { nombre: 'Soc. Com. Contreras Ltda', comuna: 'Iquique', venta: 28253957, cajas: 1784, pct: 0.75 },
  { nombre: 'Alvarez Eusebio Gladis Jaquelin', comuna: 'Iquique', venta: 27127173, cajas: 2191, pct: 0.72 },
  { nombre: 'Ururi Laura Celia Nely', comuna: 'Iquique', venta: 25263355, cajas: 1495, pct: 0.67 },
  { nombre: 'Administradora de Ventas al Detalle', comuna: 'Pozo Almonte', venta: 22726931, cajas: 1165, pct: 0.60 }
];

// Compras totales de clientes CON maquina, por comuna (no promedio por maquina)
const maquinas = {
  labels: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'María Elena', 'Camiña'],
  compras: [2708650801, 1122674845, 382810212, 218296598, 12730341, 9280658, 5389774],
  nMaquinas: [984, 711, 162, 70, 8, 1, 9]
};

// Comunas con coordenadas reales, para el mapa (verificadas, no todas tienen maquina)
const mapaComunas = [
  { nombre: 'Iquique',        lat: -20.2439, lng: -70.1389, venta: 2118857693 },
  { nombre: 'Alto Hospicio',  lat: -20.2569, lng: -70.0219, venta: 1053280060 },
  { nombre: 'Pozo Almonte',   lat: -20.2908, lng: -69.6958, venta: 396621493 },
  { nombre: 'Pica',           lat: -20.4931, lng: -69.3269, venta: 137992369 },
  { nombre: 'Huara',          lat: -19.8089, lng: -69.9719, venta: 50350785 },
  { nombre: 'Camiña',         lat: -20.4828, lng: -69.3669, venta: 6276936 },
  { nombre: 'María Elena',    lat: -22.3451, lng: -69.6615, venta: 6528455 },
  { nombre: 'Las Condes',     lat: -33.4089, lng: -70.5693, venta: 6526708 },
  { nombre: 'Talca',          lat: -35.4264, lng: -71.6554, venta: 2306764 },
  { nombre: 'Quilicura',      lat: -33.3667, lng: -70.7333, venta: 2165956 },
  { nombre: 'Calama',         lat: -22.4667, lng: -68.9333, venta: 529280 },
  { nombre: 'Quilpué',        lat: -33.0472, lng: -71.4419, venta: 74340 }
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

  // fila de encabezados
  const headerRow = document.createElement('div');
  headerRow.className = 'heat-row';
  headerRow.innerHTML = '<div></div>' + vendedores.map(v => `<div class="heat-head">${v}</div>`).join('');
  container.appendChild(headerRow);

  Object.entries(heatData).forEach(([comuna, valores]) => {
    const row = document.createElement('div');
    row.className = 'heat-row';
    let html = `<div class="heat-rowlabel">${comuna}</div>`;
    valores.forEach((v, i) => {
      html += `<div class="heat-cell" style="background:${colorFor(v, maxVal)}">
                 <span class="heat-tip">${vendedores[i]}: ${v > 0 ? clpCompacto(v) : 'sin venta'}</span>
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