import { useEffect } from 'react';

export const useFooterEffects = () => {
  useEffect(() => {
    const footer = document.querySelector('.footer-main') as HTMLElement | null;
    const socialLinks = document.querySelectorAll('.footer-social-link') as NodeListOf<HTMLElement>;
    const newsletterForm = document.querySelector('.footer-newsletter-form') as HTMLFormElement | null;
    const newsletterInput = document.querySelector('.footer-newsletter-input') as HTMLInputElement | null;

    // Glowing effect on scroll
    const handleFooterGlow = () => {
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const isVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;
        if (isVisible) {
          const visibility = Math.max(0, Math.min(1, (window.innerHeight - footerRect.top) / window.innerHeight));
          footer.style.setProperty('--footer-glow-opacity', visibility.toString());
        }
      }
    };

    // Enhanced social link hover effects
    socialLinks.forEach((link) => {
      link.addEventListener('mouseenter', function (this: HTMLElement) {
        this.style.transform = 'translateY(-4px) scale(1.05)';
        this.style.boxShadow = '0 8px 25px rgba(var(--color-accent-rgb), 0.4)';
      });

      link.addEventListener('mouseleave', function (this: HTMLElement) {
        this.style.transform = 'translateY(-2px) scale(1)';
        this.style.boxShadow = '0 0 20px rgba(var(--color-accent-rgb), 0.3)';
      });
    });

    // Newsletter form enhancement
    if (newsletterForm && newsletterInput) {
      newsletterForm.addEventListener('submit', function (this: HTMLFormElement, e: Event) {
        e.preventDefault();
        const input = newsletterInput as HTMLInputElement;
        const email = input.value.trim();
        const button = this.querySelector('.footer-newsletter-btn') as HTMLElement | null;
        if (email && isValidEmail(email)) {
          if (button) {
            const originalText = button.textContent;
            button.textContent = 'Đã Đăng Ký!';
            button.style.background = 'var(--color-accent)';
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
              button.textContent = originalText;
              button.style.background = '';
              button.style.transform = '';
              input.value = '';
            }, 2000);
          }
          showNotification('Đăng ký thành công! Cảm ơn bạn đã quan tâm.', 'success');
        } else {
          showNotification('Vui lòng nhập email hợp lệ.', 'error');
        }
      });

      newsletterInput.addEventListener('input', function (this: HTMLInputElement) {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
          this.style.borderColor = 'var(--color-accent)';
          this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';
        } else {
          this.style.borderColor = '';
          this.style.boxShadow = '';
        }
      });
    }

    // Email validation helper
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Simple notification system
    const showNotification = (message: string, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? 'var(--color-accent)' : '#ff6b6b'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
      });
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    };

    // Parallax effect for background elements
    const initParallaxEffect = () => {
      const glowElements = document.querySelectorAll('.footer-glow-top, .footer-glow-bottom') as NodeListOf<HTMLElement>;
      const updateParallax = () => {
        if (footer) {
          const scrolled = window.pageYOffset;
          const footerRect = footer.getBoundingClientRect();
          if (footerRect.top < window.innerHeight) {
            glowElements.forEach((element, index) => {
              const speed = index % 2 === 0 ? 0.3 : -0.2;
              const yPos = scrolled * speed;
              element.style.transform = `translateY(${yPos}px)`;
            });
          }
        }
      };
      window.addEventListener('scroll', updateParallax, { passive: true });
      return () => window.removeEventListener('scroll', updateParallax);
    };

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('footer-animate-in');
          const sections = entry.target.querySelectorAll('.footer-section') as NodeListOf<HTMLElement>;
          sections.forEach((section, index) => {
            setTimeout(() => {
              section.style.opacity = '1';
              section.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      });
    }, observerOptions);
    if (footer) footerObserver.observe(footer);

    // Initial styles for animation
    const sections = document.querySelectorAll('.footer-section') as NodeListOf<HTMLElement>;
    sections.forEach((section) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    window.addEventListener('scroll', handleFooterGlow, { passive: true });
    const cleanupParallax = initParallaxEffect();

    return () => {
      window.removeEventListener('scroll', handleFooterGlow);
      cleanupParallax();
      if (footer) footerObserver.unobserve(footer);
      socialLinks.forEach((link) => {
        link.removeEventListener('mouseenter', () => {});
        link.removeEventListener('mouseleave', () => {});
      });
      if (newsletterForm) newsletterForm.removeEventListener('submit', () => {});
      if (newsletterInput) newsletterInput.removeEventListener('input', () => {});
    };
  }, []);
};