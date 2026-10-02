function setupScrollTopButton(): void {
  const button = document.querySelector<HTMLButtonElement>('.scroll-top-button');
  if (!button) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateButtonVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > 420);
  };

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotionQuery.matches ? 'auto' : 'smooth',
    });
  });

  updateButtonVisibility();
  window.addEventListener('scroll', updateButtonVisibility, { passive: true });
}

setupScrollTopButton();
