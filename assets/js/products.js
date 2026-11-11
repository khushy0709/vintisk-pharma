/**
 * VINTISK PHARMACEUTICALS PVT. LTD.
 * Product Portfolio & Branded Generics Catalogue
 * 
 * Source of Truth:
 * Vintisk Pharmaceuticals is a pharmaceutical marketing company marketing branded
 * generics in the Indian domestic market. Products are manufactured through trusted
 * contract manufacturing partners operating WHO-GMP and ISO-certified facilities.
 */

const THERAPEUTIC_SEGMENTS = [
  'All Formulations',
  'Paediatrics',
  'Gynaecology',
  'Gastroenterology',
  'Orthopaedics',
  'Urology',
  'Cardiology',
  'Diabetics',
  'Neurology',
  'Other Segments'
];

const PHARMA_PRODUCTS = [
  {
    id: 'prod-01',
    name: '[Branded Generic VP-01] - Pediatric Suspension',
    category: 'Paediatrics',
    composition: '[Cefixime Oral Suspension IP 50mg / 5ml]',
    dosageForm: 'Syrups',
    packaging: '30ml Dry Syrup with Sterile Water for Injections',
    therapeuticSegment: 'Paediatrics',
    description: 'Antibiotic oral suspension for paediatric infections. Manufactured by WHO-GMP certified partner.',
    storage: 'Store below 25°C, protect from moisture and direct sunlight',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-02',
    name: '[Branded Generic VP-02] - Gynae Nutrition',
    category: 'Gynaecology',
    composition: '[Ferrous Ascorbate + Folic Acid + Zinc Tablets]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Alu-Alu Blister Pack',
    therapeuticSegment: 'Gynaecology',
    description: 'Haematinic formulation for prenatal and maternal healthcare support.',
    storage: 'Store in a cool, dry place away from light',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-03',
    name: '[Branded Generic VP-03] - Gastro Protective',
    category: 'Gastroenterology',
    composition: '[Pantoprazole Gastro-Resistant & Domperidone Prolonged Release Capsules IP]',
    dosageForm: 'Capsules',
    packaging: '10 x 10 Alu-Alu Blister Strip',
    therapeuticSegment: 'Gastroenterology',
    description: 'Proton pump inhibitor with prokinetic agent for acid-peptic disorders.',
    storage: 'Store protected from light and moisture at a temperature not exceeding 30°C',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-04',
    name: '[Branded Generic VP-04] - Ortho Pain Care',
    category: 'Orthopaedics',
    composition: '[Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg Tablets]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Blister Pack',
    therapeuticSegment: 'Orthopaedics',
    description: 'Triple active anti-inflammatory and proteolytic enzyme combination for musculoskeletal pain.',
    storage: 'Store in a dry place at controlled room temperature',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-05',
    name: '[Branded Generic VP-05] - Urological Care',
    category: 'Urology',
    composition: '[Tamsulosin Hydrochloride 0.4mg + Dutasteride 0.5mg Tablets]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Alu-Alu Strip',
    therapeuticSegment: 'Urology',
    description: 'Dual-action therapy for benign prostatic hyperplasia (BPH) management.',
    storage: 'Store below 25°C in the original carton',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-06',
    name: '[Branded Generic VP-06] - Cardio Care',
    category: 'Cardiology',
    composition: '[Telmisartan 40mg + Amlodipine 5mg Tablets IP]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Alu-Alu Blister',
    therapeuticSegment: 'Cardiology',
    description: 'Synergistic ARB and calcium channel blocker combination for essential hypertension.',
    storage: 'Store protected from heat and moisture',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-07',
    name: '[Branded Generic VP-07] - Glycemic Control',
    category: 'Diabetics',
    composition: '[Glimepiride 1mg / 2mg + Metformin Hydrochloride 500mg SR Tablets]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Blister Strip',
    therapeuticSegment: 'Diabetics',
    description: 'Oral antidiabetic formulation for comprehensive glycemic regulation in Type 2 Diabetes.',
    storage: 'Store in a cool, dry place. Keep out of reach of children.',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-08',
    name: '[Branded Generic VP-08] - Neuro Protection',
    category: 'Neurology',
    composition: '[Citicoline 500mg + Piracetam 800mg Tablets]',
    dosageForm: 'Tablets',
    packaging: '10 x 10 Alu-Alu Pack',
    therapeuticSegment: 'Neurology',
    description: 'Neuroprotective and cognitive enhancer formulation for neurological rehabilitation.',
    storage: 'Store below 25°C, protect from moisture',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-09',
    name: '[Branded Generic VP-09] - Paediatric Drops',
    category: 'Paediatrics',
    composition: '[Vitamin D3 Oral Drops IP 800 IU / ml]',
    dosageForm: 'Drops',
    packaging: '15ml Amber Glass Bottle with Calibrated Dropper',
    therapeuticSegment: 'Paediatrics',
    description: 'Essential micronutrient drops supporting infant bone mineralization and immunity.',
    storage: 'Store below 25°C, do not freeze',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  },
  {
    id: 'prod-10',
    name: '[Branded Generic VP-10] - Critical Care Injection',
    category: 'Other Segments',
    composition: '[Pantoprazole for Injection BP 40mg (Lyophilized)]',
    dosageForm: 'Injections',
    packaging: 'Sterile Glass Vial with Sterile Water for Injection (WFI)',
    therapeuticSegment: 'Other Segments',
    description: 'Parenteral proton pump inhibitor for hospital critical care and in-patient use.',
    storage: 'Store below 25°C, protect from direct light',
    manufacturingNotice: 'Manufactured by established contract manufacturing partners operating WHO-GMP & ISO-certified facilities.'
  }
];

let activeFilter = 'All Formulations';
let searchQuery = '';

function renderProducts() {
  const container = document.getElementById('productsContainer');
  const countBadge = document.getElementById('productResultsCount');
  if (!container) return;

  const filtered = PHARMA_PRODUCTS.filter(item => {
    const matchesCategory = activeFilter === 'All Formulations' || item.category.toLowerCase() === activeFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      item.name.toLowerCase().includes(query) ||
      item.composition.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.dosageForm.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Formulations Listed`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--slate-50); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
        <h3 style="color: var(--navy-900); margin-bottom: 0.5rem; font-size: 1.25rem;">No Formulations Found</h3>
        <p style="color: var(--slate-500); font-size: 0.9375rem; margin-bottom: 1.5rem;">Try adjusting your therapeutic segment filter or search keywords.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()">Show All Formulations</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prod => `
    <article class="product-card" id="${prod.id}">
      <div class="product-card-top">
        <div class="product-badge-row">
          <span class="category-tag">${prod.category}</span>
          <span class="badge-tag">${prod.dosageForm}</span>
        </div>
        <h3 class="product-name">${prod.name}</h3>
        <p class="product-composition"><strong>Active Composition:</strong> ${prod.composition}</p>
        
        <div class="product-specs-list">
          <div class="spec-row">
            <span class="spec-label">Dosage Form:</span>
            <span class="spec-value">${prod.dosageForm}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Packaging:</span>
            <span class="spec-value">${prod.packaging}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Segment:</span>
            <span class="spec-value">${prod.therapeuticSegment}</span>
          </div>
        </div>
      </div>

      <div class="product-card-actions">
        <button class="btn btn-outline btn-sm" onclick="openProductDetail('${prod.id}')">
          View Details
        </button>
        <a href="contact.html?product=${encodeURIComponent(prod.name)}" class="btn btn-teal btn-sm">
          Enquire About Product
        </a>
      </div>
    </article>
  `).join('');
}

function openProductDetail(productId) {
  const prod = PHARMA_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const modalOverlay = document.getElementById('productDetailModal');
  const modalContent = document.getElementById('modalDynamicContent');
  if (!modalOverlay || !modalContent) return;

  modalContent.innerHTML = `
    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;">
      <span class="category-tag">${prod.category}</span>
      <span class="badge-tag">${prod.dosageForm}</span>
    </div>
    <h2 style="font-size: 1.5rem; color: var(--navy-900); margin-bottom: 0.75rem; font-weight: 800;">${prod.name}</h2>
    <p style="color: var(--slate-600); margin-bottom: 1.5rem; font-size: 0.95rem;">
      <strong>Active Composition:</strong> ${prod.composition}
    </p>

    <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div class="spec-row">
        <span class="spec-label">Dosage Form:</span>
        <span class="spec-value">${prod.dosageForm}</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Commercial Packaging:</span>
        <span class="spec-value">${prod.packaging}</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Therapeutic Segment:</span>
        <span class="spec-value">${prod.therapeuticSegment}</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Storage Conditions:</span>
        <span class="spec-value">${prod.storage}</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Clinical Overview:</span>
        <span class="spec-value">${prod.description}</span>
      </div>
    </div>

    <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 1rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-bottom: 2rem; font-size: 0.85rem; color: #166534;">
      <strong>Manufacturing Compliance:</strong> ${prod.manufacturingNotice}
    </div>

    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button class="btn btn-outline" onclick="closeProductDetail()">Close</button>
      <a href="contact.html?product=${encodeURIComponent(prod.name)}" class="btn btn-teal">
        Enquire About This Product
      </a>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  const modalOverlay = document.getElementById('productDetailModal');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function resetFilters() {
  activeFilter = 'All Formulations';
  searchQuery = '';
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) searchInput.value = '';
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'All Formulations');
  });

  renderProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.category || 'All Formulations';
      renderProducts();
    });
  });

  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  const modalOverlay = document.getElementById('productDetailModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeProductDetail();
      }
    });
  }

  renderProducts();
});
