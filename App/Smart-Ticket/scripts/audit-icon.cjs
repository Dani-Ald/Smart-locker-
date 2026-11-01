// Auditoría conservadora del símbolo completo, sin modificar imágenes.
// pngjs ya está disponible transitivamente en las herramientas de Expo.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { PNG } = require('pngjs');

for (const name of ['BOT.png', 'BOT-icon.png', 'BOT-adaptive.png']) {
  const image = PNG.sync.read(readFileSync(resolve(__dirname, '../assets/images', name)));
  let radius = 0;
  const bounds = [image.width, image.height, 0, 0];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      // Ignora únicamente blanco/casi blanco y transparencia del lienzo.
      if (image.data[i + 3] > 32 && Math.min(...image.data.subarray(i, i + 3)) < 230) {
        bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
        radius = Math.max(radius, Math.hypot(x - image.width / 2, y - image.height / 2));
      }
    }
  }
  const safeRadius = name.includes('adaptive') ? image.width * 33 / 108 : image.width / 2;
  console.log({ name, width: image.width, height: image.height, bounds, radius: Math.round(radius),
    circularSafeRadius: Math.round(safeRadius),
    plus10Fits: radius * 1.1 <= safeRadius, plus15Fits: radius * 1.15 <= safeRadius });
}
