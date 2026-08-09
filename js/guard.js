(() => {
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
      (e.ctrlKey && ['u', 's', 'p'].includes(k))
    ) {
      e.preventDefault();
    }
  });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
})();