export async function compressFilesUsingCanvas(files: File[], options?: { maxWidthOrHeight?: number; quality?: number }): Promise<File[]> {
  const maxDim = options?.maxWidthOrHeight ?? 1920;
  const quality = options?.quality ?? 0.8; // 0-1 for JPEG

  const compressOne = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(1, maxDim / Math.max(width, height));
        const targetW = Math.round(width * ratio);
        const targetH = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = 'jpg';
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
                type: `image/jpeg`,
                lastModified: Date.now(),
              });
              resolve(compressed);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });

  const results: File[] = [];
  for (const f of files) {
    // Apenas comprime imagens
    if (!f.type.startsWith('image/')) {
      results.push(f);
      continue;
    }
    // Evita compressão para imagens muito pequenas (<200KB)
    if (f.size < 200 * 1024) {
      results.push(f);
      continue;
    }
    // Executa compressão
    const c = await compressOne(f);
    // Se por algum motivo ficou maior, mantém original
    results.push(c.size > f.size ? f : c);
  }
  return results;
}
