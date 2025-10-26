// ============================================
// ADJUSTABLE FOOTER NAVBAR CHANGE
// ============================================

window.addEventListener('load', function() {
  // ============================================
  // CONFIGURATION - ADJUST THIS!
  // ============================================
  const SETTINGS = {
    // When to trigger the change (in pixels BEFORE navbar touches footer)
    // 0 = exactly when touching
    // 100 = 100px before touching
    // -50 = 50px after touching (more inside footer)
    triggerOffset: 0
  };
  
  const navbar = document.querySelector('nav');
  const footer = document.querySelector('.footer-section');
  
  if (!navbar || !footer) return;
  
  function checkFooterPosition() {
    const footerTop = footer.getBoundingClientRect().top;
    const navbarHeight = navbar.offsetHeight;
    const triggerPoint = navbarHeight + SETTINGS.triggerOffset;
    
    if (footerTop <= triggerPoint) {
      navbar.classList.add('over-footer');
    } else {
      navbar.classList.remove('over-footer');
    }
  }
  
  // Check on scroll with throttle for performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        checkFooterPosition();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Check initially
  checkFooterPosition();
  
  // ============================================
  // FESTIVE CONSOLE MESSAGE
  // ============================================
  console.log('%c🎄 Rock Christmas Village - Κακοπετριά', 'color: #936336; font-size: 20px; font-weight: bold;');
  console.log('%cΚαλώς ήρθατε στο χριστουγεννιάτικο χωριό! 🎅', 'color: #d3a096; font-size: 14px;');
  console.log('%cWebsite developed with ❤️ for the community', 'color: #f7f3ee; font-size: 12px;');
});