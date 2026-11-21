/**
 * VINTISK PHARMACEUTICALS PVT. LTD.
 * Interactive India Domestic Market Presence Visualizer
 * Focus: Domestic Indian Market (Uttar Pradesh, Madhya Pradesh, Maharashtra)
 */

function initIndiaMarketVisual(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <svg viewBox="0 0 900 520" style="width: 100%; height: 100%; display: block;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="indiaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1"/>
        </pattern>
        
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#159D9A" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/>
        </linearGradient>

        <filter id="hubGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background Grid -->
      <rect width="900" height="520" fill="url(#indiaGrid)" />

      <!-- Stylized Outline Representation of Indian Subcontinent -->
      <g fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5">
        <!-- Northern boundary -->
        <path d="M 380 50 Q 420 30 450 60 T 470 100 T 520 120" />
        <!-- East & Northeast -->
        <path d="M 520 120 Q 560 140 600 130 T 680 150 T 690 190 T 630 220" />
        <!-- Coastlines (East & West) down to South -->
        <path d="M 630 220 Q 590 280 570 340 T 520 420 T 470 480" />
        <path d="M 470 480 Q 440 430 420 360 T 370 290 T 340 230 T 350 170 T 380 100 Z" />
      </g>

      <!-- Shaded Region Highlights for Major Domestic Markets -->
      <!-- Uttar Pradesh Region -->
      <path d="M 460 140 Q 520 135 560 160 Q 550 205 490 210 Q 450 190 460 140 Z" 
            fill="rgba(21, 157, 154, 0.15)" stroke="#159D9A" stroke-width="1.5" stroke-dasharray="3,3" />

      <!-- Madhya Pradesh Region -->
      <path d="M 420 210 Q 490 200 520 230 Q 510 280 430 280 Q 400 245 420 210 Z" 
            fill="rgba(2, 132, 199, 0.15)" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" />

      <!-- Maharashtra Region -->
      <path d="M 360 270 Q 430 275 450 320 Q 430 370 380 370 Q 350 330 360 270 Z" 
            fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3,3" />

      <!-- Connection Route Lines between Key Hubs -->
      <!-- Thane/Maharashtra to Prayagraj/UP -->
      <path d="M 380 310 Q 440 240 520 175" fill="none" stroke="url(#routeGradient)" stroke-width="2.5" stroke-dasharray="6,4">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
      </path>

      <!-- Thane/Maharashtra to MP Expansion Hub -->
      <path d="M 380 310 Q 420 280 465 245" fill="none" stroke="url(#routeGradient)" stroke-width="2" stroke-dasharray="5,3">
        <animate attributeName="stroke-dashoffset" from="80" to="0" dur="2.5s" repeatCount="indefinite" />
      </path>

      <!-- MP Hub to Prayagraj/UP Hub -->
      <path d="M 465 245 Q 495 210 520 175" fill="none" stroke="url(#routeGradient)" stroke-width="2" stroke-dasharray="5,3">
        <animate attributeName="stroke-dashoffset" from="80" to="0" dur="2.5s" repeatCount="indefinite" />
      </path>

      <!-- Key Hub 1: MAHARASHTRA (Thane - Registered Corporate Base) -->
      <g transform="translate(380, 310)">
        <circle r="16" fill="#159D9A" opacity="0.25">
          <animate attributeName="r" values="8;22;8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle r="7" fill="#159D9A" stroke="#ffffff" stroke-width="2" filter="url(#hubGlow)"/>
        <text x="-10" y="24" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">
          Maharashtra
        </text>
        <text x="-10" y="38" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500">
          Thane (Regd. Office)
        </text>
      </g>

      <!-- Key Hub 2: UTTAR PRADESH (Prayagraj - Regional Operations Office) -->
      <g transform="translate(520, 175)">
        <circle r="16" fill="#0284c7" opacity="0.25">
          <animate attributeName="r" values="8;22;8" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" filter="url(#hubGlow)"/>
        <text x="14" y="0" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">
          Uttar Pradesh
        </text>
        <text x="14" y="15" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500">
          Prayagraj (Regional Office)
        </text>
      </g>

      <!-- Key Hub 3: MADHYA PRADESH (Active Domestic Market Expansion) -->
      <g transform="translate(465, 245)">
        <circle r="14" fill="#06b6d4" opacity="0.25">
          <animate attributeName="r" values="6;18;6" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle r="6" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" filter="url(#hubGlow)"/>
        <text x="12" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">
          Madhya Pradesh
        </text>
        <text x="12" y="18" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="500">
          Distribution Network
        </text>
      </g>

      <!-- Legend Panel -->
      <g transform="translate(40, 430)">
        <rect width="280" height="60" rx="8" fill="rgba(10, 25, 47, 0.85)" stroke="rgba(255, 255, 255, 0.12)" />
        <circle cx="20" cy="20" r="5" fill="#159D9A" />
        <text x="35" y="24" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600">Current Major Markets</text>
        <circle cx="20" cy="42" r="5" fill="#0284c7" />
        <text x="35" y="46" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="11">Domestic Distribution Corridors</text>
      </g>
    </svg>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initIndiaMarketVisual('indiaMarketVisual');
  initIndiaMarketVisual('indiaMarketVisualPreview');
});
