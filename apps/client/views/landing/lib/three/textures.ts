import { CanvasTexture, DataTexture, NearestFilter, RedFormat } from 'three';

const TOON_STEPS = [90, 170, 255];
const BLOB_SIZE = 64;

export const toonGradient = () => {
  const texture = new DataTexture(Uint8Array.from(TOON_STEPS), TOON_STEPS.length, 1, RedFormat);

  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;

  return texture;
};

export const softDisc = (color: string) => {
  const canvas = document.createElement('canvas');

  canvas.width = BLOB_SIZE;
  canvas.height = BLOB_SIZE;

  const context = canvas.getContext('2d');
  const half = BLOB_SIZE / 2;

  if (context) {
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, BLOB_SIZE, BLOB_SIZE);
  }

  return new CanvasTexture(canvas);
};
