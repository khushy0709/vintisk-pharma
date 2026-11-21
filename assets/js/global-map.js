/**
 * VINTISK PHARMACEUTICALS PVT. LTD.
 * Interactive Global Network Visualization
 * Renders an interactive abstract SVG world network with pulsating pharmaceutical supply nodes.
 */

function initGlobalNetwork(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Render high-tech SVG world network visual
  container.innerHTML = `
    <svg viewBox="0 0 1000 500" style="width: 100%; height: 100%; display: block;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Grid Pattern -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1"/>
        </pattern>
        
        <!-- Gradient for connection arcs -->
        <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#159D9A" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8"/>
        </linearGradient>

        <!-- Glow filter -->
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background Grid -->
      <rect width="1000" height="500" fill="url(#grid)" />

      <!-- Abstract Continents Dots / Outlines (Stylized Scientific World Map) -->
      <g fill="rgba(255, 255, 255, 0.12)">
        <!-- North America dots cluster -->
        <circle cx="210" cy="160" r="3" /><circle cx="230" cy="150" r="2.5" /><circle cx="250" cy="170" r="3" />
        <circle cx="220" cy="190" r="2" /><circle cx="270" cy="180" r="3" /><circle cx="190" cy="170" r="2.5" />
        <circle cx="240" cy="210" r="3" /><circle cx="290" cy="160" r="2" />
        
        <!-- South America dots cluster -->
        <circle cx="320" cy="310" r="3" /><circle cx="340" cy="330" r="2.5" /><circle cx="330" cy="360" r="3" />
        <circle cx="350" cy="380" r="2" /><circle cx="325" cy="410" r="2.5" />

        <!-- Europe dots cluster -->
        <circle cx="510" cy="140" r="2.5" /><circle cx="530" cy="130" r="3" /><circle cx="550" cy="150" r="2.5" />
        <circle cx="520" cy="165" r="3" /><circle cx="540" cy="170" r="2" />

        <!-- Africa dots cluster -->
        <circle cx="520" cy="240" r="3" /><circle cx="540" cy="270" r="2.5" /><circle cx="550" cy="310" r="3" />
        <circle cx="570" cy="340" r="2" /><circle cx="560" cy="370" r="2.5" /><circle cx="590" cy="280" r="3" />

        <!-- Asia & India (Core Hub) cluster -->
        <circle cx="680" cy="170" r="3" /><circle cx="710" cy="180" r="2.5" /><circle cx="750" cy="190" r="3" />
        <circle cx="780" cy="210" r="2" /><circle cx="820" cy="220" r="3" /><circle cx="790" cy="260" r="2.5" />
        <circle cx="650" cy="230" r="3" /><circle cx="690" cy="240" r="3.5" /><circle cx="710" cy="260" r="3" />

        <!-- Australia cluster -->
        <circle cx="830" cy="370" r="3" /><circle cx="860" cy="380" r="2.5" /><circle cx="840" cy="400" r="2" />
      </g>

      <!-- Connection Lines radiating from India Hub (680, 245) -->
      <!-- India to Middle East / Emerging Markets -->
      <path d="M 680 245 Q 630 200 580 220" fill="none" stroke="url(#cyanLineGrad)" stroke-width="2" stroke-dasharray="6,4">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
      </path>

      <!-- India to Africa Partner Markets -->
      <path d="M 680 245 Q 610 270 550 310" fill="none" stroke="url(#cyanLineGrad)" stroke-width="2" stroke-dasharray="6,4">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
      </path>

      <!-- India to CIS / Central Asia -->
      <path d="M 680 245 Q 650 170 620 160" fill="none" stroke="url(#cyanLineGrad)" stroke-width="2" stroke-dasharray="6,4">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4.5s" repeatCount="indefinite" />
      </path>

      <!-- India to Southeast Asia -->
      <path d="M 680 245 Q 740 250 780 270" fill="none" stroke="url(#cyanLineGrad)" stroke-width="2" stroke-dasharray="6,4">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3.5s" repeatCount="indefinite" />
      </path>

      <!-- India to Latin America / Global Network -->
      <path d="M 680 245 Q 480 320 340 330" fill="none" stroke="url(#cyanLineGrad)" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6">
        <animate attributeName="stroke-dashoffset" from="120" to="0" dur="7s" repeatCount="indefinite" />
      </path>

      <!-- India Core Hub Node (Vintisk Base) -->
      <g transform="translate(680, 245)">
        <circle r="16" fill="#159D9A" opacity="0.25">
          <animate attributeName="r" values="8;24;8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle r="7" fill="#159D9A" stroke="#ffffff" stroke-width="2" filter="url(#glow)"/>
        <text x="12" y="5" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700">
          India Hub (HQ)
        </text>
      </g>

      <!-- Market Node 1: [COUNTRY / MARKET 01] -->
      <g transform="translate(580, 220)">
        <circle r="9" fill="#0284c7" opacity="0.3">
          <animate attributeName="r" values="5;14;5" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        <text x="10" y="4" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600">
          [COUNTRY / MARKET 01]
        </text>
      </g>

      <!-- Market Node 2: [COUNTRY / MARKET 02] -->
      <g transform="translate(550, 310)">
        <circle r="9" fill="#0284c7" opacity="0.3">
          <animate attributeName="r" values="5;14;5" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        <text x="10" y="4" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600">
          [COUNTRY / MARKET 02]
        </text>
      </g>

      <!-- Market Node 3: [COUNTRY / MARKET 03] -->
      <g transform="translate(620, 160)">
        <circle r="9" fill="#0284c7" opacity="0.3">
          <animate attributeName="r" values="5;14;5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        <text x="10" y="4" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600">
          [COUNTRY / MARKET 03]
        </text>
      </g>

      <!-- Market Node 4: [COUNTRY / MARKET 04] -->
      <g transform="translate(780, 270)">
        <circle r="9" fill="#0284c7" opacity="0.3">
          <animate attributeName="r" values="5;14;5" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        <text x="10" y="4" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600">
          [COUNTRY / MARKET 04]
        </text>
      </g>

      <!-- Market Node 5: [COUNTRY / MARKET 05] -->
      <g transform="translate(340, 330)">
        <circle r="9" fill="#0284c7" opacity="0.3">
          <animate attributeName="r" values="5;14;5" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        <text x="10" y="4" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600">
          [COUNTRY / MARKET 05]
        </text>
      </g>
    </svg>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobalNetwork('globalNetworkVisual');
  initGlobalNetwork('globalNetworkVisualPreview');
});
