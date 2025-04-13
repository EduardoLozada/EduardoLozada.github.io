/**
 * Resource Optimizer Script
 * Optimiza la carga de recursos para mejorar el rendimiento
 */

(function() {
  'use strict';

  // Configuración
  const config = {
    preconnectDomains: true,        // Preconectar a dominios externos
    prioritizeCriticalAssets: true, // Priorizar recursos críticos
    deferOffscreenStyles: true,     // Diferir estilos fuera de pantalla
    optimizeThirdPartyScripts: true // Optimizar scripts de terceros
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Inicializa el optimizador de recursos
   */
  function init() {
    // Optimizar carga de recursos críticos
    if (config.prioritizeCriticalAssets) {
      prioritizeCriticalAssets();
    }

    // Preconectar a dominios externos
    if (config.preconnectDomains) {
      setupPreconnect();
    }

    // Diferir estilos fuera de pantalla
    if (config.deferOffscreenStyles) {
      deferOffscreenStyles();
    }

    // Optimizar scripts de terceros
    if (config.optimizeThirdPartyScripts) {
      optimizeThirdPartyScripts();
    }

    // Optimizar fuentes web
    optimizeWebFonts();

    // Optimizar imágenes
    optimizeImages();

    // Optimizar CSS
    optimizeCSS();

    // Registrar métricas de rendimiento
    registerPerformanceMetrics();
  }

  /**
   * Prioriza la carga de recursos críticos
   */
  function prioritizeCriticalAssets() {
    // Lista de recursos críticos para el LCP
    const criticalAssets = [
      'assets/images/signature.png',
      'assets/images/slider/slide1.jpeg',
      'assets/css/style.css'
    ];

    // Precargar recursos críticos
    criticalAssets.forEach(asset => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      
      // Determinar el tipo de recurso
      if (asset.endsWith('.css')) {
        preloadLink.as = 'style';
      } else if (asset.endsWith('.js')) {
        preloadLink.as = 'script';
      } else if (/\.(jpe?g|png|gif|svg|webp)$/i.test(asset)) {
        preloadLink.as = 'image';
      }
      
      preloadLink.href = asset;
      document.head.appendChild(preloadLink);
    });
  }

  /**
   * Configura preconexiones a dominios externos
   */
  function setupPreconnect() {
    // Lista de dominios a los que preconectar
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
      'https://code.jquery.com',
      'https://unpkg.com'
    ];

    // Crear preconexiones
    domains.forEach(domain => {
      // Verificar si ya existe
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        
        // Añadir crossorigin para dominios de fuentes
        if (domain.includes('fonts.gstatic.com')) {
          link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Difiere la carga de estilos no críticos
   */
  function deferOffscreenStyles() {
    // Seleccionar estilos no críticos
    const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
    
    nonCriticalStyles.forEach(link => {
      // Guardar href original
      const href = link.href;
      
      // Cambiar a preload
      link.rel = 'preload';
      link.as = 'style';
      link.onload = function() {
        // Restaurar como stylesheet cuando se cargue
        this.onload = null;
        this.rel = 'stylesheet';
      };
    });
  }

  /**
   * Optimiza scripts de terceros
   */
  function optimizeThirdPartyScripts() {
    // Añadir atributos async o defer a scripts no críticos
    const scripts = document.querySelectorAll('script[src]:not([data-critical="true"])');
    
    scripts.forEach(script => {
      // No modificar scripts que ya tienen async o defer
      if (!script.async && !script.defer) {
        // Usar defer para scripts que no necesitan ejecutarse inmediatamente
        script.defer = true;
      }
    });
    
    // Cargar scripts de análisis de forma asíncrona
    const analyticsScripts = document.querySelectorAll('script[src*="analytics"], script[src*="gtag"], script[src*="gtm"]');
    analyticsScripts.forEach(script => {
      script.async = true;
    });
  }

  /**
   * Optimiza la carga de fuentes web
   */
  function optimizeWebFonts() {
    // Detectar soporte para font-display
    const fontDisplaySupported = CSS && CSS.supports && CSS.supports('font-display', 'swap');
    
    // Si no es compatible, aplicar manualmente
    if (!fontDisplaySupported) {
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
    
    // Añadir font-display: swap a las hojas de estilo de fuentes
    const fontStylesheets = document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    fontStylesheets.forEach(stylesheet => {
      const href = stylesheet.href;
      if (!href.includes('&display=swap')) {
        stylesheet.href = href + (href.includes('?') ? '&' : '?') + 'display=swap';
      }
    });
  }

  /**
   * Optimiza la carga y renderizado de imágenes
   */
  function optimizeImages() {
    // Aplicar lazy loading nativo a imágenes
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      // No aplicar a imágenes críticas para LCP
      if (!img.hasAttribute('data-critical')) {
        img.loading = 'lazy';
      }
      
      // Añadir decoding async para mejorar rendimiento
      img.decoding = 'async';
      
      // Asegurar que las imágenes tienen dimensiones explícitas
      if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
        // Si la imagen ya está cargada, usar sus dimensiones naturales
        if (img.complete && img.naturalWidth > 0) {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
        }
      }
    });
    
    // Optimizar imágenes de fondo
    const bgElements = document.querySelectorAll('[style*="background-image"]');
    bgElements.forEach(el => {
      // Añadir clase para optimizaciones CSS
      el.classList.add('optimized-bg');
    });
  }

  /**
   * Optimiza la carga y aplicación de CSS
   */
  function optimizeCSS() {
    // Detectar si hay animaciones en la página
    const hasAnimations = document.querySelector('.animated, [class*="anim"], [class*="fade"]');
    
    // Si no hay animaciones, desactivar temporalmente las transiciones durante la carga
    if (!hasAnimations) {
      const style = document.createElement('style');
      style.textContent = `
        body.loading * {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
      
      document.body.classList.add('loading');
      
      // Eliminar clase después de que la página esté completamente cargada
      window.addEventListener('load', () => {
        // Pequeño retraso para asegurar que los estilos se apliquen correctamente
        setTimeout(() => {
          document.body.classList.remove('loading');
        }, 100);
      });
    }
  }

  /**
   * Registra métricas de rendimiento para análisis
   */
  function registerPerformanceMetrics() {
    // Solo registrar si la API de Performance está disponible
    if (!window.performance || !window.performance.getEntriesByType) {
      return;
    }
    
    // Registrar cuando la página esté completamente cargada
    window.addEventListener('load', () => {
      setTimeout(() => {
        // Obtener métricas de navegación
        const navEntry = performance.getEntriesByType('navigation')[0];
        
        // Calcular tiempos clave
        const metrics = {
          // Tiempo hasta que el DOM está listo
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
          // Tiempo total de carga
          loadTime: navEntry.loadEventEnd - navEntry.startTime,
          // Tiempo de bloqueo del renderizado por scripts
          blockingTime: navEntry.domContentLoadedEventStart - navEntry.domainLookupStart - navEntry.connectEnd,
          // Tiempo hasta primer byte
          ttfb: navEntry.responseStart - navEntry.requestStart
        };
        
        // Registrar métricas en consola para desarrollo
        console.debug('Performance Metrics:', metrics);
        
        // Aquí se podrían enviar las métricas a un servicio de análisis
      }, 0);
    });
    
    // Registrar métricas web vitals si están disponibles
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.debug('LCP:', lastEntry.startTime);
        }).observe({type: 'largest-contentful-paint', buffered: true});
        
        // FID (First Input Delay)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            console.debug('FID:', entry.processingStart - entry.startTime);
          });
        }).observe({type: 'first-input', buffered: true});
        
        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              console.debug('CLS:', clsValue);
            }
          });
        }).observe({type: 'layout-shift', buffered: true});
      } catch (e) {
        console.warn('Error registrando métricas web vitals:', e);
      }
    }
  }

})();