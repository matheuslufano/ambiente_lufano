/** Reads selectable PDF text locally. Scanned PDFs require OCR, which is not enabled. */
export async function readPdfSyllabus(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Escolha um PDF de até 20 MB.");
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  try {
    const document = await task.promise;
    if (document.numPages > 300)
      throw new Error(
        "Escolha um PDF de até 300 páginas ou cole o trecho da matéria.",
      );
    const pages: string[] = [];
    for (let i = 1; i <= document.numPages; i++) {
      const page = await document.getPage(i);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) =>
            "str" in item
              ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
              : "",
          )
          .join(""),
      );
      page.cleanup();
    }
    const text = pages.join("\n").trim();
    if (!text)
      throw new Error(
        "Este PDF não contém texto selecionável. Cole o texto da matéria; OCR não está disponível.",
      );
    return text;
  } finally {
    await task.destroy();
  }
}
