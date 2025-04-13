/**
 * Performance Optimizer Script
 * Optimiza el rendimiento general de la aplicación
 */

(function() {
  'use strict';

  // Configuración
  const config = {
    deferNonCriticalCSS: true,
    optimizeAnimations: true,
    prefetchLinks: true,
    monitorPerformance: true,
    minInteractionDelay: 100 // ms mínimo entre interacciones para evitar layout thrashing
  };

  // Variables de estado
  let lastScrollTime = 0;
  let lastResizeTime = 0;
  let pendingAnimationFrame = false;
  let performanceMetrics = {};

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Inicializa el optimizador de rendimiento
   */
  function init() {
    // Optimizar carga de recursos
    optimizeResourceLoading();
    
    // Optimizar animaciones
    if (config.optimizeAnimations) {
      optimizeAnimations();
    }
    
    // Prefetch de enlaces
    if (config.prefetchLinks) {
      setupLinkPrefetching();
    }
    
    // Monitorear rendimiento
    if (config.monitorPerformance) {
      setupPerformanceMonitoring();
    }
    
    // Optimizar eventos de scroll y resize
    optimizeScrollAndResize();
    
    // Optimizar interacciones de usuario
    optimizeUserInteractions();
    
    // Optimizar Web Fonts
    optimizeWebFonts();
    
    // Eliminar scripts innecesarios
    removeUnnecessaryScripts();
    
    // Corregir problemas conocidos
    fixKnownIssues();
  }

  /**
   * Optimiza la carga de recursos
   */
  function optimizeResourceLoading() {
    // Diferir CSS no crítico
    if (config.deferNonCriticalCSS) {
      const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
      
      nonCriticalCSS.forEach(link => {
        // Cambiar a preload con onload
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'style');
        link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
      });
    }
    
    // Cargar scripts de forma asíncrona
    const nonCriticalScripts = document.querySelectorAll('script:not([data-critical="true"])');
    
    nonCriticalScripts.forEach(script => {
      if (!script.async && !script.defer && !script.hasAttribute('type')) {
        script.defer = true;
      }
    });
  }

  /**
   * Optimiza animaciones para reducir reflows y repaints
   */
  function optimizeAnimations() {
    // Forzar aceleración por hardware en elementos animados
    const animatedElements = document.querySelectorAll('.animated, .menu-block, .social a, .btn-download');
    
    animatedElements.forEach(el => {
      el.style.willChange = 'transform, opacity';
      
      // Limpiar willChange después de la animación para liberar recursos
      el.addEventListener('animationend', function() {
        setTimeout(() => {
          el.style.willChange = 'auto';
        }, 300);
      }, { once: true });
    });
    
    // Optimizar GSAP si está disponible
    if (window.gsap) {
      // Usar force3D para mejor rendimiento
      gsap.config({
        force3D: true
      });
    }
  }

  /**
   * Configura prefetching de enlaces para mejorar navegación
   */
  function setupLinkPrefetching() {
    // Prefetch en hover
    const links = document.querySelectorAll('a:not([data-no-prefetch])');
    
    links.forEach(link => {
      // Solo prefetch enlaces internos
      if (link.hostname === window.location.hostname) {
        link.addEventListener('mouseenter', function() {
          const href = link.getAttribute('href');
          
          if (href && !prefetchedUrls.has(href)) {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
            
            prefetchedUrls.add(href);
          }
        });
      }
    });
  }
  
  // Set para rastrear URLs ya prefetched
  const prefetchedUrls = new Set();

  /**
   * Configura monitoreo de rendimiento
   */
  function setupPerformanceMonitoring() {
    // Monitorear métricas web vitals si está disponible
    if ('PerformanceObserver' in window) {
      try {
        // FID (First Input Delay)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            performanceMetrics.fid = entry.processingStart - entry.startTime;
            console.debug('FID:', performanceMetrics.fid);
          });
        }).observe({type: 'first-input', buffered: true});
        
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          performanceMetrics.lcp = lastEntry.startTime;
          console.debug('LCP:', performanceMetrics.lcp);
        }).observe({type: 'largest-contentful-paint', buffered: true});
        
        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              performanceMetrics.cls = clsValue;
              console.debug('CLS:', performanceMetrics.cls);
            }
          });
        }).observe({type: 'layout-shift', buffered: true});
      } catch (e) {
        console.warn('PerformanceObserver error:', e);
      }
    }
  }

  /**
   * Optimiza eventos de scroll y resize para evitar jank
   */
  function optimizeScrollAndResize() {
    // Optimizar scroll con requestAnimationFrame
    window.addEventListener('scroll', function() {
      const now = Date.now();
      
      // Limitar frecuencia de procesamiento
      if (now - lastScrollTime > config.minInteractionDelay) {
        lastScrollTime = now;
        
        if (!pendingAnimationFrame) {
          pendingAnimationFrame = true;
          
          requestAnimationFrame(function() {
            // Aquí iría el código que responde al scroll
            pendingAnimationFrame = false;
          });
        }
      }
    }, {passive: true});
    
    // Optimizar resize con debounce
    let resizeTimeout;
    window.addEventListener('resize', function() {
      const now = Date.now();
      
      if (now - lastResizeTime > 100) { // Debounce más agresivo para resize
        lastResizeTime = now;
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          // Aquí iría el código que responde al resize
        }, 150);
      }
    }, {passive: true});
  }

  /**
   * Optimiza interacciones de usuario para evitar bloqueos
   */
  function optimizeUserInteractions() {
    // Optimizar eventos de clic
    document.addEventListener('click', function(e) {
      // Verificar si el clic es en un botón o enlace
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || 
          e.target.closest('button') || e.target.closest('a')) {
        
        // Añadir clase para feedback visual inmediato
        const clickTarget = e.target.tagName === 'BUTTON' || e.target.tagName === 'A' ? 
                           e.target : e.target.closest('button') || e.target.closest('a');
        
        clickTarget.classList.add('clicked');
        
        // Eliminar clase después de la animación
        setTimeout(() => {
          clickTarget.classList.remove('clicked');
        }, 300);
      }
    }, {passive: true});
  }

  /**
   * Optimiza carga de Web Fonts
   */
  function optimizeWebFonts() {
    // Detectar soporte para font-display
    const isFontDisplaySupported = CSS && CSS.supports && CSS.supports('font-display', 'swap');
    
    // Si no es compatible, aplicar manualmente
    if (!isFontDisplaySupported) {
      // Clase para ocultar texto hasta que las fuentes estén cargadas
      document.documentElement.classList.add('fonts-loading');
      
      // Verificar cuando las fuentes estén cargadas
      if ('fonts' in document) {
        Promise.all([
          document.fonts.load('300 1em Poppins'),
          document.fonts.load('400 1em Poppins'),
          document.fonts.load('500 1em Poppins'),
          document.fonts.load('600 1em Poppins')
        ]).then(() => {
          document.documentElement.classList.remove('fonts-loading');
          document.documentElement.classList.add('fonts-loaded');
        });
      } else {
        // Fallback: mostrar texto después de un tiempo
        setTimeout(() => {
          document.documentElement.classList.remove('fonts-loading');
        }, 1000);
      }
    }
  }

  /**
   * Elimina scripts innecesarios o problemáticos
   */
  function removeUnnecessaryScripts() {
    // Buscar scripts conocidos que causan problemas
    const problematicScripts = [
      'script[src*="getVideoIframe"]',
      'script[src*="plugins.min.js"]'
    ];
    
    problematicScripts.forEach(selector => {
      const scripts = document.querySelectorAll(selector);
      scripts.forEach(script => {
        // Desactivar en lugar de eliminar para evitar errores
        if (script.parentNode) {
          script.setAttribute('data-disabled', 'true');
          script.type = 'text/disabled';
        }
      });
    });
  }

  /**
   * Corrige problemas conocidos
   */
  function fixKnownIssues() {
    // Corregir problema con Owl Carousel si existe
    if (typeof $.fn !== 'undefined' && $.fn.owlCarousel) {
      // Parche para evitar errores de Owl Carousel
      const originalOwlCarousel = $.fn.owlCarousel;
      $.fn.owlCarousel = function() {
        try {
          return originalOwlCarousel.apply(this, arguments);
        } catch (e) {
          console.warn('Owl Carousel error intercepted:', e);
          return this;
        }
      };
    }
    
    // Corregir problema con Typed.js si existe
    if (typeof $.fn !== 'undefined' && $.fn.typed) {
      const originalTyped = $.fn.typed;
      $.fn.typed = function() {
        try {
          return originalTyped.apply(this, arguments);
        } catch (e) {
          console.warn('Typed.js error intercepted:', e);
          return this;
        }
      };
    }
  }

})();