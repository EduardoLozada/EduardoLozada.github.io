/**
 * Android Detector
 * Script para detectar dispositivos Android y aplicar clases específicas
 * para mejorar la experiencia de usuario en estos dispositivos
 */

(function() {
  // Función para detectar si el dispositivo es Android
  function isAndroidDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }
  
  // Función para detectar si es un dispositivo móvil
  function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }
  
  // Función para aplicar clases específicas para Android
  function applyAndroidOptimizations() {
    if (isAndroidDevice()) {
      document.documentElement.classList.add('android-device');
      
      // Detectar versiones antiguas de Android para optimizaciones más estrictas
      const match = navigator.userAgent.toLowerCase().match(/android\s([0-9\.]*)/i);
      if (match && match[1]) {
        const version = parseInt(match[1], 10);
        if (version < 9) {
          document.documentElement.classList.add('android-strict-optimization');
        }
      }
      
      // Ajustar viewport para evitar problemas de zoom en Android
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Ajustar elementos específicos para Android
      adjustAndroidElements();
    } else if (isMobileDevice()) {
      document.documentElement.classList.add('mobile-device');
    }
  }
  
  // Función para ajustar elementos específicos en Android
  function adjustAndroidElements() {
    // Ajustar tarjetas de navegación
    const navCards = document.querySelectorAll('.navigation-cards');
    if (navCards.length > 0) {
      // Asegurarse de que las tarjetas de navegación tengan el layout correcto
      navCards.forEach(navCard => {
        navCard.style.display = 'grid';
        navCard.style.gridTemplateColumns = 'repeat(2, 1fr)';
        navCard.style.gap = '10px';
      });
    }
    
    // Ajustar sección de perfil
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
      const profileContent = profileSection.querySelector('.profile-content');
      if (profileContent) {
        profileContent.style.flexDirection = 'column';
        profileContent.style.alignItems = 'center';
      }
      
      const profileDetails = profileSection.querySelectorAll('.detail-item');
      profileDetails.forEach(item => {
        item.style.flexDirection = 'column';
        item.style.textAlign = 'center';
      });
    }
    
    // Ajustar botones y elementos táctiles
    const touchElements = document.querySelectorAll('button, .btn, a.menu-item, .nav-link');
    touchElements.forEach(el => {
      el.style.minHeight = '48px';
      el.style.minWidth = '48px';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
    });
  }
  
  // Ejecutar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    applyAndroidOptimizations();
    
    // Volver a aplicar optimizaciones cuando cambie la orientación
    window.addEventListener('orientationchange', function() {
      setTimeout(adjustAndroidElements, 300);
    });
    
    // Volver a aplicar optimizaciones cuando se redimensione la ventana
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(adjustAndroidElements, 300);
    });
  });
})();