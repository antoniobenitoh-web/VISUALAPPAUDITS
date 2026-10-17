export class ImageCompressionService {
  /**
   * Comprime una imagen tomada con la cámara antes de guardarla o subirla a Google Sheets.
   * Reduce resolución máxima a 1280px y comprime a JPEG 0.75 para ocupar <200KB.
   */
  static async compressImage(fileOrBase64: File | string, maxDimension = 1280, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto 2D del Canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Retornar dataURL comprimida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = (err) => reject(err);

      if (typeof fileOrBase64 === 'string') {
        img.src = fileOrBase64;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(fileOrBase64);
      }
    });
  }
}
