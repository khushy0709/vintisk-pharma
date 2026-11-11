/**
 * VINTISK PHARMACEUTICALS PVT. LTD.
 * Core UI Script: Navigation, Sticky States, Mobile Drawer, Modals & Toast Alerts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header scroll effect
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    const mobileLinks = mobileDrawer.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Adapt links for file:// protocol direct opening
  if (window.location.protocol === 'file:') {
    document.querySelectorAll('a[href="/batch-verification"]').forEach(a => {
      a.setAttribute('href', 'batch-verification.html');
    });
    document.querySelectorAll('a[href="/admin"]').forEach(a => {
      a.setAttribute('href', 'admin.html');
    });
  }

  // 4. Highlight current page in navbar
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html') || (currentPath === 'batch-verification.html' && linkHref === '/batch-verification')) {
      link.classList.add('active');
    }
  });

  // 4. Global Contact Form submission handler
  const contactForm = document.getElementById('b2bEnquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> Submitting Enquiry...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast('Enquiry received. The Vintisk Pharma commercial team will connect with you within 24 business hours.');
      }, 1100);
    });
  }

  // 5. Check URL for pre-selected product inquiry parameter
  const urlParams = new URLSearchParams(window.location.search);
  const inquiryProduct = urlParams.get('product');
  if (inquiryProduct) {
    const productField = document.getElementById('productInput');
    const messageField = document.getElementById('messageInput');
    if (productField) {
      productField.value = decodeURIComponent(inquiryProduct);
    }
    if (messageField) {
      messageField.value = `Hello Vintisk Pharma Team, we are interested in discussing distribution / supply terms for: ${decodeURIComponent(inquiryProduct)}.`;
    }
  }

  const inquiryService = urlParams.get('service');
  if (inquiryService) {
    const reqTypeSelect = document.getElementById('requirementType');
    if (reqTypeSelect) {
      reqTypeSelect.value = inquiryService;
    }
  }
});

/**
 * Toast Notification Helper
 */
function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a3c4" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <div style="font-size: 0.9rem; font-weight: 500; color: #fff;">${message}</div>
  `;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
