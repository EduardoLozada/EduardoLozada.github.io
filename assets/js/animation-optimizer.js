/**
 * Animation Optimizer Script
 * Optimiza las animaciones para mejorar el rendimiento y la experiencia en dispositivos móviles
 * Versión mejorada para Android
 */

(function() {
  'use strict';

  // Configuración
  const config = {
    reduceMotion: true,            // Reducir animaciones automáticamente
    optimizeGSAP: true,            // Optimizar animaciones GSAP
    throttleAnimations: true,      // Limitar frecuencia de animaciones
    disableHeavyEffectsOnMobile: true, // Desactivar efectos pesados en móviles
    disableRotationOnAndroid: true,  // Desactivar rotaciones en Android
    forceDisableRotation: true,     // Forzar desactivación de rotaciones en todos los dispositivos
    strictAndroidOptimization: true, // Optimización estricta para Android (soluciona problemas de rotación)
    improveAndroidPerformance: true  // Mejoras adicionales de rendimiento para Android
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
    
    // Detectar si es un dispositivo Android específicamente - Mejorado para mayor precisión y fiabilidad
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChromeMobile = /Chrome/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);
    const isAndroidBrowser = /Android/i.test(navigator.userAgent) && /Version\/\d/i.test(navigator.userAgent);
    const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
    const isDefinitelyAndroid = isAndroid || (isChromeMobile && /Android/i.test(navigator.userAgent)) || isAndroidBrowser || isSamsungBrowser;
    
    // Aplicar configuración basada en preferencias del usuario y tipo de dispositivo
    if (isReducedMotionPreferred || config.reduceMotion || isDefinitelyAndroid) {
      document.documentElement.classList.add('reduced-motion');
    }
    
    // Si es Android, añadir clase específica para optimizaciones adicionales
    if (isDefinitelyAndroid) {
      document.documentElement.classList.add('android-device');
      // Forzar reducción de movimiento en Android para evitar problemas de rendimiento
      config.reduceMotion = true;
      config.disableHeavyEffectsOnMobile = true;
      config.disableRotationOnAndroid = true;
      config.forceDisableRotation = true;
      
      // Aplicar optimización estricta si está configurada
      if (config.strictAndroidOptimization) {
        document.documentElement.classList.add('android-strict-optimization');
      }
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
   * Versión mejorada para solucionar problemas en Android
   */
  function optimizeHoverEffects() {
    // Seleccionar elementos con efectos hover - Ampliado para incluir más elementos
    const hoverElements = document.querySelectorAll(
      '.btn, .social a, .menu-item, .portfolio-card, .skill-card, ' +
      '.testimonial-card, .nav-card, .blog-card, .icon-container, ' +
      '.floating-social a, .floating-social li, [class*="hover"], ' +
      '[class*="anim"], [class*="fade"], [class*="tilt"]'
    );
    
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
      if (isLowEndDevice || isMobile) {
        el.style.transitionDuration = '0.2s';
      }
      
      // Prevenir rotaciones en dispositivos Android y móviles
      if (/Android/i.test(navigator.userAgent) || isMobile) {
        // Eliminar cualquier transformación existente
        el.style.transform = 'none';
        el.style.rotate = '0deg';
        el.style.perspective = 'none';
        el.style.transformStyle = 'flat';
        
        // Aplicar solo transformación vertical en hover
        el.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-5px)';
          this.style.rotate = '0deg';
          this.style.perspective = 'none';
          this.style.transformStyle = 'flat';
        });
        
        el.addEventListener('mouseleave', function() {
          this.style.transform = 'none';
          this.style.rotate = '0deg';
          this.style.perspective = 'none';
          this.style.transformStyle = 'flat';
        });
        
        // Aplicar los mismos efectos para eventos táctiles
        el.addEventListener('touchstart', function() {
          this.style.transform = 'translateY(-5px)';
          this.style.rotate = '0deg';
          this.style.perspective = 'none';
          this.style.transformStyle = 'flat';
        }, { passive: true });
        
        el.addEventListener('touchend', function() {
          this.style.transform = 'none';
          this.style.rotate = '0deg';
          this.style.perspective = 'none';
          this.style.transformStyle = 'flat';
        }, { passive: true });
      }
    });
    
    // Desactivar animaciones de rotación en GSAP para todos los dispositivos móviles
    if ((isMobile || /Android/i.test(navigator.userAgent)) && window.gsap) {
      try {
        // Sobrescribir métodos de GSAP para prevenir rotaciones
        const originalTo = gsap.to;
        gsap.to = function(targets, vars) {
          // Eliminar propiedades de rotación y transformación 3D
          if (vars) {
            vars.rotation = 0;
            vars.rotateX = 0;
            vars.rotateY = 0;
            vars.rotateZ = 0;
            vars.rotate = 0;
            vars.transformPerspective = 0;
            vars.transformStyle = 'flat';
            
            // Limitar transformaciones a solo desplazamiento vertical
            if (vars.x) vars.x = 0;
            if (vars.z) vars.z = 0;
            
            // Reducir duración de animaciones
            if (vars.duration && vars.duration > 0.5) {
              vars.duration = 0.5;
            }
          }
          return originalTo.call(this, targets, vars);
        };
        
        // También sobrescribir otros métodos de animación
        if (gsap.fromTo) {
          const originalFromTo = gsap.fromTo;
          gsap.fromTo = function(targets, fromVars, toVars) {
            // Eliminar propiedades de rotación
            if (toVars) {
              toVars.rotation = 0;
              toVars.rotateX = 0;
              toVars.rotateY = 0;
              toVars.rotateZ = 0;
              toVars.rotate = 0;
              toVars.transformPerspective = 0;
              toVars.transformStyle = 'flat';
              
              // Limitar transformaciones
              if (toVars.x) toVars.x = 0;
              if (toVars.z) toVars.z = 0;
            }
            return originalFromTo.call(this, targets, fromVars, toVars);
          };
        }
      } catch (e) {
        console.warn('Error al modificar GSAP para dispositivos móviles:', e);
      }
    }
  }

  /**
   * Aplica optimizaciones específicas para dispositivos móviles
   * Versión mejorada para solucionar problemas en Android
   */
  function applyMobileOptimizations() {
    // Desactivar efectos complejos en móviles
    const complexEffects = document.querySelectorAll('.parallax-effect, .complex-animation, [data-tilt], [data-animation], .animated, .gsap-animated');
    complexEffects.forEach(el => {
      el.classList.add('disabled-on-mobile');
    });
    
    // Desactivar completamente VanillaTilt en móviles
    if (window.VanillaTilt) {
      // Eliminar atributos data-tilt de todos los elementos
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach(el => {
        el.removeAttribute('data-tilt');
        // Eliminar cualquier transformación aplicada por VanillaTilt
        el.style.transform = 'none';
        el.style.transition = 'opacity 0.3s ease, box-shadow 0.3s ease';
      });
      
      // Intentar destruir instancias existentes de VanillaTilt
      try {
        if (typeof VanillaTilt.destroy === 'function') {
          VanillaTilt.destroy(document.querySelectorAll('.js-tilt, [data-tilt]'));
        }
      } catch (e) {
        console.warn('No se pudieron destruir instancias de VanillaTilt:', e);
      }
    }
    
    // Desactivar rotaciones en tarjetas e iconos - Implementación mejorada
    const cardElements = document.querySelectorAll(
      '.card, .portfolio-card, .skill-card, .testimonial-card, .social a, .icon-container, ' +
      '.nav-card, .floating-social a, .floating-social li, .btn, .menu-item, .menu-block, ' +
      '.animated, [class*="anim"], [class*="fade"], [class*="rotate"], [class*="flip"], ' +
      '[class*="tilt"], [class*="hover"], [style*="transform"], [style*="rotate"], ' +
      '[style*="perspective"], [data-animation], .gsap-animated'
    );
    
    cardElements.forEach(el => {
      // Añadir clase para estilos CSS
      el.classList.add('no-rotation');
      
      // Aplicar estilos inline para forzar la desactivación de rotaciones
      el.style.transform = 'none';
      el.style.transition = 'opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease';
      el.style.perspective = 'none';
      el.style.rotate = '0deg';
      el.style.transformStyle = 'flat';
      
      // Eliminar listeners de eventos que podrían causar rotaciones
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      
      // Añadir listener para permitir solo desplazamiento vertical en hover
      clone.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.rotate = '0deg';
        this.style.perspective = 'none';
        this.style.transformStyle = 'flat';
      });
      
      clone.addEventListener('mouseleave', function() {
        this.style.transform = 'none';
        this.style.rotate = '0deg';
        this.style.perspective = 'none';
      });
    });
    
    // Desactivar específicamente las rotaciones en elementos con animaciones GSAP
    if (window.gsap) {
      try {
        // Sobrescribir métodos de GSAP para prevenir rotaciones en todos los dispositivos móviles
        const originalTo = gsap.to;
        gsap.to = function(targets, vars) {
          // Eliminar propiedades de rotación y transformación 3D
          if (vars) {
            vars.rotation = 0;
            vars.rotateX = 0;
            vars.rotateY = 0;
            vars.rotateZ = 0;
            vars.rotate = 0;
            vars.transformPerspective = 0;
            vars.transformStyle = 'flat';
            
            // Limitar transformaciones a solo desplazamiento vertical
            if (vars.x) vars.x = 0;
            if (vars.z) vars.z = 0;
            
            // Reducir duración de animaciones
            if (vars.duration && vars.duration > 0.5) {
              vars.duration = 0.5;
            }
          }
          return originalTo.call(this, targets, vars);
        };
        
        // Aplicar a todos los elementos animados por GSAP
        const gsapElements = document.querySelectorAll('.gsap-animated, [data-animation]');
        gsapElements.forEach(el => {
          el.classList.add('no-rotation');
          el.style.transform = 'none';
          el.style.rotate = '0deg';
          el.style.perspective = 'none';
          el.style.transformStyle = 'flat';
        });
      } catch (e) {
        console.warn('Error al modificar GSAP para dispositivos móviles:', e);
      }
    }
    
    // Optimizar imágenes y fondos para mejor rendimiento
    const bgElements = document.querySelectorAll('.bgScroll, .bg-image, [style*="background"]');
    bgElements.forEach(el => {
      el.classList.add('reduced-quality-mobile');
      // Forzar scroll en lugar de fixed para mejor rendimiento
      el.style.backgroundAttachment = 'scroll';
      el.style.backgroundSize = 'cover';
    });
    
    // Añadir estilos específicos para móviles y Android - Implementación mejorada
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
      /* Optimizaciones generales para móviles */
      @media (max-width: 768px) {
        /* Desactivar efectos complejos */
        .disabled-on-mobile {
          transform: none !important;
          transition: opacity 0.3s ease-out, box-shadow 0.3s ease !important;
          animation: none !important;
          perspective: none !important;
          rotate: 0deg !important;
          transform-style: flat !important;
        }
        
        /* Optimizar imágenes de fondo */
        .reduced-quality-mobile {
          background-attachment: scroll !important;
          background-size: cover !important;
          background-position: center center !important;
        }
        
        /* Optimizar transiciones de página */
        .page-transitioning * {
          transition-duration: 0.3s !important;
        }
        
        /* Prevenir rotaciones */
        .no-rotation {
          transform: none !important;
          transition: opacity 0.3s ease-out, box-shadow 0.3s ease, transform 0.3s ease !important;
          animation: none !important;
          perspective: none !important;
          rotate: 0deg !important;
          transform-style: flat !important;
        }
        
        /* Permitir solo desplazamiento vertical en hover */
        .no-rotation:hover,
        .card:hover,
        .portfolio-card:hover,
        .skill-card:hover,
        .testimonial-card:hover,
        .nav-card:hover,
        .blog-card:hover,
        .btn:hover,
        .menu-item:hover,
        .social a:hover,
        .icon-container:hover {
          transform: translateY(-5px) !important;
          rotate: 0deg !important;
          perspective: none !important;
          transform-style: flat !important;
        }
        
        /* Eliminar pseudo-elementos que puedan causar problemas */
        .portfolio-card::before,
        .portfolio-card::after,
        .skill-card::before,
        .skill-card::after,
        .testimonial-card::before,
        .testimonial-card::after,
        .nav-card::before,
        .nav-card::after,
        .btn::before,
        .btn::after {
          display: none !important;
        }
        
        /* Optimizar iconos */
        .icon-container i,
        .social a i,
        .floating-social a i,
        .floating-social li i,
        [class*="icon"],
        [class*="fa-"] {
          transform: none !important;
          transition: opacity 0.3s ease, color 0.3s ease !important;
          rotate: 0deg !important;
          animation: none !important;
        }
        
        /* Desactivar todas las animaciones de rotación */
        [class*="rotate"],
        [class*="perspective"],
        [class*="flip"],
        [class*="tilt"],
        [style*="rotate"],
        [style*="perspective"],
        [style*="transform"] {
          transform: none !important;
          rotate: 0deg !important;
          perspective: none !important;
          transform-style: flat !important;
          transition: opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
        }
        
        /* Optimizar menús y navegación */
        .menu-block,
        .menu-item,
        .nav-item,
        .navbar,
        header,
        .header {
          transform: none !important;
          perspective: none !important;
          rotate: 0deg !important;
          transition: opacity 0.3s ease, background-color 0.3s ease !important;
        }
        
        /* Mejorar espaciado y tamaños para móviles */
        h1, h2, h3 {
          margin-bottom: 15px !important;
        }
        
        p, .text-content {
          margin-bottom: 20px !important;
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        
        .btn, button {
          padding: 10px 20px !important;
          margin: 10px 0 !important;
          min-height: 44px !important; /* Mejorar accesibilidad táctil */
        }
        
        /* Mejorar espaciado de contenedores */
        .container, .row, section {
          padding-left: 15px !important;
          padding-right: 15px !important;
          margin-bottom: 30px !important;
        }
      }
      
      /* Estilos específicos para Android - Optimización completa */
      .android-device .portfolio-card,
      .android-device .skill-card,
      .android-device .testimonial-card,
      .android-device .social a,
      .android-device .icon-container,
      .android-device .nav-card,
      .android-device .blog-card,
      .android-device .floating-social a,
      .android-device .floating-social li,
      .android-device .btn,
      .android-device .menu-item,
      .android-device .menu-block,
      .android-device [class*="anim"],
      .android-device [class*="fade"] {
        transform: none !important;
        transition: opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
        animation: none !important;
        perspective: none !important;
        rotate: 0deg !important;
        transform-style: flat !important;
      }
      
      /* Permitir solo desplazamiento vertical en hover para Android */
      .android-device .portfolio-card:hover,
      .android-device .skill-card:hover,
      .android-device .testimonial-card:hover,
      .android-device .social a:hover,
      .android-device .icon-container:hover,
      .android-device .nav-card:hover,
      .android-device .blog-card:hover,
      .android-device .floating-social a:hover,
      .android-device .floating-social li:hover,
      .android-device .btn:hover,
      .android-device .menu-item:hover {
        transform: translateY(-5px) !important;
        rotate: 0deg !important;
        perspective: none !important;
        transform-style: flat !important;
      }
      
      /* Optimización estricta para Android - Soluciona problemas de rotación */
      .android-strict-optimization * {
        transform: none !important;
        rotate: 0deg !important;
        perspective: none !important;
        transform-style: flat !important;
        transition: opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, color 0.3s ease !important;
      }
      
      /* Permitir solo desplazamiento vertical en hover para optimización estricta */
      .android-strict-optimization *:hover {
        transform: translateY(-5px) !important;
        rotate: 0deg !important;
        perspective: none !important;
        transform-style: flat !important;
      }
      
      /* Desactivar animaciones específicas que causan problemas en Android */
      .android-device [class*="rotate"],
      .android-device [class*="perspective"],
      .android-device [class*="flip"],
      .android-device [class*="tilt"],
      .android-device [style*="rotate"],
      .android-device [style*="perspective"],
      .android-device [style*="transform"] {
        transform: none !important;
        rotate: 0deg !important;
        perspective: none !important;
        transform-style: flat !important;
        transition: opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
      }
      
      /* Mejorar rendimiento de scroll en Android */
      .android-device .content-blocks,
      .android-device .scrollable,
      .android-device [class*="scroll"] {
        -webkit-overflow-scrolling: touch !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        scroll-behavior: smooth !important;
      }
      
      /* Optimizar tamaños de toque para Android */
      .android-device .btn,
      .android-device button,
      .android-device .menu-item,
      .android-device a,
      .android-device input,
      .android-device select {
        min-height: 48px !important;
        min-width: 48px !important;
        padding: 12px 24px !important;
        margin: 8px 0 !important;
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