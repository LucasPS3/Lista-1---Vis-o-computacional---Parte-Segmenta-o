const originalCanvas = document.getElementById('originalCanvas');
const msCanvas = document.getElementById('msCanvas');
const cannyCanvas = document.getElementById('cannyCanvas');

const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
const msCtx = msCanvas.getContext('2d', { willReadFrequently: true });
const cannyCtx = cannyCanvas.getContext('2d', { willReadFrequently: true });

let originalImage = null;

const lowSlider = document.getElementById('lowThresh');
const highSlider = document.getElementById('highThresh');
const lowValue = document.getElementById('lowValue');
const highValue = document.getElementById('highValue');

lowSlider.oninput = () => lowValue.textContent = lowSlider.value;
highSlider.oninput = () => highValue.textContent = highSlider.value;

document.getElementById('loadBtn').onclick = loadImage;
document.getElementById('applyBtn').onclick = applyMeanShiftCanny;

function loadImage() {
    const imageName = document.getElementById('imageSelect').value;
    const img = new Image();
    img.src = '../Imagens/' + imageName;
    img.onload = function() {
        originalImage = img;
        originalCanvas.width = msCanvas.width = cannyCanvas.width = img.width;
        originalCanvas.height = msCanvas.height = cannyCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
}

function applyMeanShiftCanny() {
    if (!originalImage) return;

    const low = parseInt(lowSlider.value);
    const high = parseInt(highSlider.value);

    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const msData = meanShiftSegment(imageData, 10, 20); // hs=10, hr=20 fixos
    msCtx.putImageData(msData, 0, 0);

    const cannyData = applyCanny(msData, low, high);
    cannyCtx.putImageData(cannyData, 0, 0);
}

// --- Função simplificada de Mean Shift ---
function meanShiftSegment(imageData, hs, hr) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src);

    const windowRadius = hs;
    const maxIter = 3;
    const neighbors = [];
    for (let dy = -windowRadius; dy <= windowRadius; dy++)
        for (let dx = -windowRadius; dx <= windowRadius; dx++)
            neighbors.push([dx, dy]);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0,
                g = 0,
                b = 0,
                count = 0;
            for (let iter = 0; iter < maxIter; iter++) {
                r = g = b = count = 0;
                for (let n = 0; n < neighbors.length; n++) {
                    const nx = x + neighbors[n][0];
                    const ny = y + neighbors[n][1];
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const idx = (ny * width + nx) * 4;
                    const dr = src[idx] - src[(y * width + x) * 4];
                    const dg = src[idx + 1] - src[(y * width + x) * 4 + 1];
                    const db = src[idx + 2] - src[(y * width + x) * 4 + 2];
                    if (Math.sqrt(dr * dr + dg * dg + db * db) < hr) {
                        r += src[idx];
                        g += src[idx + 1];
                        b += src[idx + 2];
                        count++;
                    }
                }
                if (count > 0) {
                    const i = (y * width + x) * 4;
                    dst[i] = r / count;
                    dst[i + 1] = g / count;
                    dst[i + 2] = b / count;
                    dst[i + 3] = 255;
                }
            }
        }
    }
    return new ImageData(dst, width, height);
}

// --- Função simplificada de Canny ---
function applyCanny(imageData, low, high) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);

    for (let i = 0; i < src.length; i += 4) {
        const gray = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
        dst[i] = dst[i + 1] = dst[i + 2] = gray;
        dst[i + 3] = 255;
    }

    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [1, 2, 1, 0, 0, 0, -1, -2, -1];
    const out = new Uint8ClampedArray(dst.length);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumX = 0,
                sumY = 0,
                k = 0;
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const idx = ((y + j) * width + (x + i)) * 4;
                    sumX += dst[idx] * gx[k];
                    sumY += dst[idx] * gy[k];
                    k++;
                }
            }
            const mag = Math.sqrt(sumX * sumX + sumY * sumY);
            const idx = (y * width + x) * 4;
            out[idx] = out[idx + 1] = out[idx + 2] = (mag >= low && mag <= high) ? 255 : 0;
            out[idx + 3] = 255;
        }
    }

    return new ImageData(out, width, height);
}

// Carrega a primeira imagem automaticamente
loadImage();