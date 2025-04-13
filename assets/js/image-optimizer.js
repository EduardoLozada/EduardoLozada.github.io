/**
 * Image Optimizer Script
 * Optimiza la carga de imágenes para mejorar el rendimiento
 */

(function() {
  'use strict';

  // Configuración
  const config = {
    lazyLoadThreshold: 200, // px antes de que el elemento sea visible
    lowQualityPreview: true, // Usar previsualizaciones de baja calidad
    preloadPriority: ['lcp', 'above-fold'] // Prioridad de precarga
  };

  // Cache de elementos
  let lazyImages = [];
  let observer = null;

  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initImageOptimizer);

  /**
   * Inicializa el optimizador de imágenes
   */
  function initImageOptimizer() {
    // Verificar soporte de IntersectionObserver
    if ('IntersectionObserver' in window) {
      setupIntersectionObserver();
    } else {
      // Fallback para navegadores antiguos
      setupLegacyLazyLoad();
    }

    // Precarga imágenes críticas para LCP (Largest Contentful Paint)
    preloadCriticalImages();

    // Optimizar imágenes de fondo
    optimizeBackgroundImages();

    // Convertir GIFs a video cuando sea posible
    convertGifsToVideos();
  }

  /**
   * Configura el IntersectionObserver para lazy loading
   */
  function setupIntersectionObserver() {
    observer = new IntersectionObserver(onIntersection, {
      rootMargin: `${config.lazyLoadThreshold}px 0px`,
      threshold: 0.01
    });

    // Seleccionar todas las imágenes con atributo data-src o class="lazy"
    lazyImages = Array.from(document.querySelectorAll('img[data-src], img.lazy, [data-background]'));
    
    // Observar cada imagen
    lazyImages.forEach(image => {
      observer.observe(image);
    });
  }

  /**
   * Callback para el IntersectionObserver
   */
  function onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Dejar de observar
        observer.unobserve(element);
        
        // Cargar la imagen
        if (element.hasAttribute('data-background')) {
          loadBackgroundImage(element);
        } else {
          loadImage(element);
        }
      }
    });
  }

  /**
   * Carga una imagen cuando es visible
   */
  function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Aplicar efecto de desvanecimiento
    img.style.opacity = '0';
    
    // Cargar imagen
    img.onload = function() {
      img.removeAttribute('data-src');
      img.classList.remove('lazy');
      
      // Animar aparición
      setTimeout(() => {
        img.style.transition = 'opacity 0.3s ease-in';
        img.style.opacity = '1';
      }, 50);
    };
    
    img.src = src;
    
    // Si hay srcset, también actualizarlo
    if (img.hasAttribute('data-srcset')) {
      img.srcset = img.getAttribute('data-srcset');
      img.removeAttribute('data-srcset');
    }
  }

  /**
   * Carga una imagen de fondo cuando es visible
   */
  function loadBackgroundImage(element) {
    const src = element.getAttribute('data-background');
    if (!src) return;
    
    // Crear imagen temporal para precargar
    const tempImg = new Image();
    tempImg.onload = function() {
      // Aplicar imagen de fondo con transición
      element.style.backgroundImage = `url(${src})`;
      element.style.transition = 'opacity 0.3s ease-in';
      element.style.opacity = '1';
      element.removeAttribute('data-background');
    };
    
    // Iniciar carga
    tempImg.src = src;
  }

  /**
   * Fallback para navegadores sin soporte de IntersectionObserver
   */
  function setupLegacyLazyLoad() {
    lazyImages = Array.from(document.querySelectorAll('img[data-src], img.lazy, [data-background]'));
    
    // Función para verificar posición
    const lazyLoad = throttle(function() {
      lazyImages = lazyImages.filter(image => {
        const rect = image.getBoundingClientRect();
        const inView = 
          rect.top <= (window.innerHeight + config.lazyLoadThreshold) && 
          rect.bottom >= -config.lazyLoadThreshold;
          
        if (inView) {
          if (image.hasAttribute('data-background')) {
            loadBackgroundImage(image);
          } else {
            loadImage(image);
          }
          return false; // Eliminar de la lista
        }
        return true; // Mantener en la lista
      });
      
      // Dejar de escuchar si no quedan imágenes
      if (lazyImages.length === 0) {
        document.removeEventListener('scroll', lazyLoad);
        window.removeEventListener('resize', lazyLoad);
        window.removeEventListener('orientationchange', lazyLoad);
      }
    }, 200);
    
    // Escuchar eventos
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationchange', lazyLoad);
    
    // Verificar imágenes iniciales
    lazyLoad();
  }

  /**
   * Precarga imágenes críticas para mejorar LCP
   */
  function preloadCriticalImages() {
    // Imágenes críticas para LCP
    const criticalImages = [
      'assets/images/signature.png',
      'assets/images/slider/slide1.jpeg'
    ];
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  /**
   * Optimiza imágenes de fondo
   */
  function optimizeBackgroundImages() {
    // Seleccionar elementos con imágenes de fondo CSS
    const bgElements = document.querySelectorAll('.bgScroll, .bg-image');
    
    bgElements.forEach(el => {
      // Si no está en el viewport, aplicar lazy loading
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        // Guardar la URL original
        const style = getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
          // Extraer URL
          const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match && match[1]) {
            // Guardar URL original como atributo
            el.setAttribute('data-background', match[1]);
            // Eliminar imagen de fondo temporalmente
            el.style.backgroundImage = 'none';
            // Reducir opacidad para transición
            el.style.opacity = '0';
            
            // Observar si existe el observer
            if (observer) {
              observer.observe(el);
            }
          }
        }
      }
    });
  }

  /**
   * Convierte GIFs a videos para mejor rendimiento
   */
  function convertGifsToVideos() {
    // Buscar GIFs en la página
    const gifs = Array.from(document.querySelectorAll('img[src$=".gif"]'));
    
    gifs.forEach(gif => {
      // Solo convertir GIFs grandes
      if (gif.width > 100 && gif.height > 100) {
        // Verificar si ya tiene un video hermano
        const parent = gif.parentNode;
        if (parent.querySelector('video')) return;
        
        // Obtener ruta del GIF
        const gifSrc = gif.src;
        const videoSrc = gifSrc.replace('.gif', '.mp4');
        
        // Verificar si existe versión MP4 (esto requeriría una verificación del servidor)
        // Por ahora asumimos que no existe y solo ocultamos GIFs grandes
        gif.style.display = 'none';
      }
    });
  }

  /**
   * Función auxiliar: throttle para limitar llamadas a funciones
   */
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

})();