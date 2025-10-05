const originalCanvas = document.getElementById('originalCanvas');
const msCanvas = document.getElementById('msCanvas');

let originalImage = null;

const hsSlider = document.getElementById('hs');
const hrSlider = document.getElementById('hr');
const hsValue = document.getElementById('hsValue');
const hrValue = document.getElementById('hrValue');

hsSlider.oninput = () => hsValue.textContent = hsSlider.value;
hrSlider.oninput = () => hrValue.textContent = hrSlider.value;

document.getElementById('loadBtn').onclick = loadImage;
document.getElementById('applyBtn').onclick = applyMeanShift;

function loadImage() {
    const imageName = document.getElementById('imageSelect').value;
    const img = new Image();
    img.src = '../Imagens/' + imageName;
    img.onload = function() {
        originalImage = img;
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        msCanvas.width = img.width;
        msCanvas.height = img.height;

        const ctx = originalCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
    };
}

function applyMeanShift() {
    if (!originalImage) return;

    const hs = parseInt(hsSlider.value);
    const hr = parseInt(hrSlider.value);

    const ctx = originalCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const segmentedData = meanShiftSegment(imageData, hs, hr);

    msCanvas.getContext('2d').putImageData(segmentedData, 0, 0);
}

// Função simplificada de Mean Shift para demonstração
function meanShiftSegment(imageData, hs, hr) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src);

    const windowRadius = hs;
    const maxIter = 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, count = 0;

            for (let iter = 0; iter < maxIter; iter++) {
                r = g = b = count = 0;

                for (let dy = -windowRadius; dy <= windowRadius; dy++) {
                    for (let dx = -windowRadius; dx <= windowRadius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                        const idx = (ny * width + nx) * 4;

                        const dr = src[idx] - src[(y*width+x)*4];
                        const dg = src[idx+1] - src[(y*width+x)*4+1];
                        const db = src[idx+2] - src[(y*width+x)*4+2];
                        const dist = Math.sqrt(dr*dr + dg*dg + db*db);

                        if (dist < hr) {
                            r += src[idx];
                            g += src[idx+1];
                            b += src[idx+2];
                            count++;
                        }
                    }
                }

                const i = (y*width+x)*4;
                dst[i] = r/count;
                dst[i+1] = g/count;
                dst[i+2] = b/count;
                dst[i+3] = 255;
            }
        }
    }

    return new ImageData(dst, width, height);
}

// Carrega automaticamente a primeira imagem
loadImage();
