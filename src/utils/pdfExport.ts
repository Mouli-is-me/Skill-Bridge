export function triggerPDFPrint(reportTitle: string = 'Skill Bridge Performance Report') {
  const originalTitle = document.title;
  document.title = `${reportTitle} - ${new Date().toISOString().slice(0, 10)}`;
  window.print();
  document.title = originalTitle;
}
