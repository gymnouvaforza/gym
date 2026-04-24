/**
 * Utilidades de imagen para el cliente.
 * Usa Canvas API para normalizar formatos sin dependencias pesadas.
 */

/**
 * Convierte cualquier archivo de imagen a image/jpeg (calidad 0.85).
 * Útil para normalizar subidas y evitar errores de formato en el servidor.
 * Se fuerza la conversión siempre para asegurar normalización de metadata y tamaño.
 */
export async function convertToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas."));
          return;
        }

        // Fondo blanco por si la imagen original tiene transparencias (PNG)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al convertir imagen a JPEG."));
              return;
            }
            
            // Limpiar nombre y asegurar extensión .jpg
            const baseName = file.name.includes(".") 
              ? file.name.split(".").slice(0, -1).join(".") 
              : file.name;
            const newName = `${baseName || "upload"}.jpg`;

            const newFile = new File([blob], newName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          "image/jpeg",
          0.85 // Calidad equilibrada
        );
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen en el cliente."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
}
