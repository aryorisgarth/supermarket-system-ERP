const PRINT_BODY_CLASS = 'report-print-mode';

export function printReport() {
  document.body.classList.add(PRINT_BODY_CLASS);

  const cleanup = () => {
    document.body.classList.remove(PRINT_BODY_CLASS);
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 1000);
}


export function printReportDeferred(callback) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (callback) callback();
      printReport();
    }, 80);
  });
}

export default printReport;
