/**
 * Animation Optimizer Script
 * Optimiza las animaciones para mejorar el rendimiento
 */

(function() {
  'use strict';

  // Configuración
  const config = {
    reduceMotion: false,           // Reducir animaciones automáticamente
    optimizeGSAP: true,           // Optimizar animaciones GSAP
    throttleAnimations: true,     // Limitar frecuencia de animaciones
    disableHeavyEffectsOnMobile: true // Desactivar efectos pesados en móviles
  };

  // Variables de estado
  let isReducedMotionPreferred = false;
  let isMobile = false;
  let isLowEndDevice = false;
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Inicializa el optimizador de animaciones
   */
  function init() {
    // Detectar preferencias y capacidades del dispositivo
    detectDeviceCapabilities();
    
    // Optimizar GSAP si está disponible
    if (config.optimizeGSAP) {
      optimizeGSAP();
    }
    
    // Optimizar animaciones CSS
    optimizeCSSAnimations();
    
    // Optimizar efectos de scroll
    optimizeScrollEffects();
    
    // Optimizar transiciones entre páginas
    optimizePageTransitions();
    
    // Optimizar efectos de hover
    optimizeHoverEffects();
    
    // Aplicar optimizaciones específicas para dispositivos móviles
    if (isMobile && config.disableHeavyEffectsOnMobile) {
      applyMobileOptimizations();
    }
    
    // Aplicar optimizaciones para dispositivos de gama baja
    if (isLowEndDevice) {
      applyLowEndDeviceOptimizations();
    }
  }

  /**
   * Detecta las capacidades del dispositivo y preferencias del usuario
   */
  function detectDeviceCapabilities() {
    // Detectar preferencia de reducción de movimiento
    isReducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Aplicar configuración basada en preferencias del usuario
    if (isReducedMotionPreferred || config.reduceMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
    
    // Detectar si es un dispositivo móvil
    isMobile = window.innerWidth < 768 || 
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detectar si es un dispositivo de gama baja
    isLowEndDevice = detectLowEndDevice();
  }

  /**
   * Detecta si el dispositivo es de gama baja
   */
  function detectLowEndDevice() {
    // Verificar memoria disponible (si está disponible)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      return true;
    }
    
    // Verificar número de núcleos lógicos
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return true;
    }
    
    // Verificar rendimiento de renderizado
    let lowFPS = false;
    let lastTime = performance.now();
    let frames = 0;
    let testDuration = 500; // ms
    
    function countFrame() {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime < testDuration) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = frames / ((currentTime - lastTime) / 1000);
        lowFPS = fps < 30;
      }
    }
    
    requestAnimationFrame(countFrame);
    
    return lowFPS;
  }

  /**
   * Optimiza animaciones GSAP
   */
  function optimizeGSAP() {
    // Verificar si GSAP está disponible
    const gsap = window.gsap;
    if (!gsap) return;
    
    try {
      // Configurar GSAP para mejor rendimiento
      gsap.config({
        force3D: true,
        nullTargetWarn: false,
        autoSleep: 60,
        autoKillThreshold: 1
      });
      
      // Optimizar ScrollTrigger si está disponible
      if (gsap.ScrollTrigger) {
        gsap.ScrollTrigger.config({
          ignoreMobileResize: true,
          autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
        });
        
        // Reducir la frecuencia de actualización en dispositivos móviles
        if (isMobile) {
          gsap.ticker.fps(30);
        }
      }
      
      // Parchar métodos GSAP para mejor rendimiento
      const originalTo = gsap.to;
      gsap.to = function(targets, vars) {
        // Asegurar que las animaciones usen transformaciones cuando sea posible
        if (vars.x || vars.y || vars.scale || vars.rotation) {
          vars.force3D = vars.force3D || true;
        }
        
        // Reducir duración en dispositivos de gama baja
        if (isLowEndDevice && vars.duration > 1) {
          vars.duration = vars.duration * 0.7;
        }
        
        // Simplificar ease en dispositivos de gama baja
        if (isLowEndDevice && vars.ease && typeof vars.ease !== 'string') {
          vars.ease = 'power1.out';
        }
        
        return originalTo.call(this, targets, vars);
      };
    } catch (e) {
      console.warn('Error optimizando GSAP:', e);
    }
  }

  /**
   * Optimiza animaciones CSS
   */
  function optimizeCSSAnimations() {
    // Seleccionar elementos con animaciones
    const animatedElements = document.querySelectorAll('.animated, [class*="anim"], [class*="fade"]');
    
    // Aplicar optimizaciones a cada elemento
    animatedElements.forEach(el => {
      // Forzar aceleración por hardware
      el.style.willChange = 'transform, opacity';
      el.style.backfaceVisibility = 'hidden';
      
      // Limpiar willChange después de la animación
      el.addEventListener('animationend', function() {
        setTimeout(() => {
          el.style.willChange = 'auto';
        }, 300);
      }, { once: true });
      
      // Reducir complejidad de animaciones en dispositivos de gama baja
      if (isLowEndDevice || isReducedMotionPreferred) {
        el.style.animationDuration = '0.5s';
        el.style.transitionDuration = '0.5s';
      }
    });
    
    // Optimizar animaciones de keyframes
    if (isLowEndDevice || isMobile) {
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px), (prefers-reduced-motion: reduce) {
          .animated {
            animation-duration: 0.5s !important;
            transition-duration: 0.5s !important;
          }
          
          @keyframes optimized-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes optimized-fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in { animation-name: optimized-fadeIn !important; }
          .fade-in-up { animation-name: optimized-fadeInUp !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Optimiza efectos de scroll
   */
  function optimizeScrollEffects() {
    // Optimizar eventos de scroll
    let lastScrollTime = 0;
    let ticking = false;
    
    function onScroll() {
      const now = Date.now();
      
      // Limitar frecuencia de procesamiento
      if (now - lastScrollTime > 16 && !ticking) { // ~60fps
        lastScrollTime = now;
        ticking = true;
        
        requestAnimationFrame(function() {
          // Aquí iría el código que responde al scroll
          // Por ejemplo, activar animaciones basadas en scroll
          
          ticking = false;
        });
      }
    }
    
    // Usar passive para mejor rendimiento
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Optimizar ScrollTrigger si existe
    if (window.gsap && window.gsap.ScrollTrigger) {
      // Reducir la frecuencia de actualización en móviles
      if (isMobile) {
        window.gsap.ScrollTrigger.config({
          ignoreMobileResize: true
        });
      }
    }
    
    // Optimizar elementos con parallax
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(el => {
      // Desactivar parallax en dispositivos móviles o de gama baja
      if (isMobile || isLowEndDevice || isReducedMotionPreferred) {
        el.removeAttribute('data-parallax');
      } else {
        // Optimizar parallax en otros dispositivos
        el.style.willChange = 'transform';
      }
    });
  }

  /**
   * Optimiza transiciones entre páginas
   */
  function optimizePageTransitions() {
    // Seleccionar enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Prevenir comportamiento por defecto
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Usar scrollIntoView con behavior smooth solo en dispositivos potentes
          if (!isLowEndDevice && !isReducedMotionPreferred) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            // Fallback para dispositivos de gama baja
            targetElement.scrollIntoView();
          }
          
          // Actualizar URL sin recargar
          history.pushState(null, null, targetId);
        }
      });
    });
    
    // Optimizar transiciones de contenido
    document.addEventListener('click', function(e) {
      // Verificar si el clic es en un elemento de menú o bloque
      if (e.target.classList.contains('menu-item') || 
          e.target.classList.contains('menu-block') || 
          e.target.closest('.menu-item') || 
          e.target.closest('.menu-block')) {
        
        // Añadir clase para optimizar la transición
        document.body.classList.add('page-transitioning');
        
        // Eliminar clase después de la transición
        setTimeout(() => {
          document.body.classList.remove('page-transitioning');
        }, 800);
      }
    });
  }

  /**
   * Optimiza efectos de hover
   */
  function optimizeHoverEffects() {
    // Seleccionar elementos con efectos hover
    const hoverElements = document.querySelectorAll('.btn, .social a, .menu-item');
    
    hoverElements.forEach(el => {
      // En dispositivos táctiles, usar enfoque en toque en lugar de hover
      if ('ontouchstart' in window) {
        el.addEventListener('touchstart', function() {
          this.classList.add('hover-touch');
        }, { passive: true });
        
        el.addEventListener('touchend', function() {
          setTimeout(() => {
            this.classList.remove('hover-touch');
          }, 300);
        }, { passive: true });
      }
      
      // Optimizar transiciones de hover
      if (isLowEndDevice) {
        el.style.transitionDuration = '0.2s';
      }
    });
  }

  /**
   * Aplica optimizaciones específicas para dispositivos móviles
   */
  function applyMobileOptimizations() {
    // Desactivar efectos complejos en móviles
    const complexEffects = document.querySelectorAll('.parallax-effect, .complex-animation, [data-tilt]');
    complexEffects.forEach(el => {
      el.classList.add('disabled-on-mobile');
    });
    
    // Desactivar VanillaTilt en móviles
    if (window.VanillaTilt) {
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach(el => {
        el.removeAttribute('data-tilt');
      });
    }
    
    // Reducir calidad de imágenes de fondo en móviles
    const bgElements = document.querySelectorAll('.bgScroll, .bg-image');
    bgElements.forEach(el => {
      el.classList.add('reduced-quality-mobile');
    });
    
    // Añadir estilos específicos para móviles
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
      @media (max-width: 768px) {
        .disabled-on-mobile {
          transform: none !important;
          transition: opacity 0.3s ease-out !important;
          animation: none !important;
        }
        
        .reduced-quality-mobile {
          background-attachment: scroll !important;
          background-size: cover !important;
        }
        
        .page-transitioning * {
          transition-duration: 0.3s !important;
        }
      }
    `;
    document.head.appendChild(mobileStyle);
  }

  /**
   * Aplica optimizaciones para dispositivos de gama baja
   */
  function applyLowEndDeviceOptimizations() {
    // Desactivar todas las animaciones no esenciales
    document.documentElement.classList.add('low-end-device');
    
    // Añadir estilos específicos para dispositivos de gama baja
    const lowEndStyle = document.createElement('style');
    lowEndStyle.textContent = `
      .low-end-device * {
        animation-duration: 0.2s !important;
        transition-duration: 0.2s !important;
      }
      
      .low-end-device .animated {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      
      .low-end-device .preloader {
        display: none !important;
      }
    `;
    document.head.appendChild(lowEndStyle);
    
    // Reducir la calidad de las imágenes
    const images = document.querySelectorAll('img:not([data-critical="true"])');
    images.forEach(img => {
      if (img.src.match(/\.(jpe?g|png)$/i)) {
        // Añadir parámetro de calidad reducida si es una URL
        if (img.src.includes('?')) {
          img.src = img.src + '&quality=50';
        } else {
          img.src = img.src + '?quality=50';
        }
      }
    });
  }

})();