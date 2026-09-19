/**
 * Converts an external image URL to a base64 data URL via canvas/fetch
 */
export async function urlToBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve({
          base64: result,
          mimeType: blob.type || 'image/jpeg',
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Fallback: draw onto canvas
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ base64: dataUrl, mimeType: 'image/jpeg' });
        } else {
          reject(new Error('Canvas context failed'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image from URL'));
      img.src = imageUrl;
    });
  }
}
