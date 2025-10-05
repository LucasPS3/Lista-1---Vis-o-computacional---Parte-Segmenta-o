function startCanny_grupo2(canvas) {
    // Função principal (quando integrada ao index)
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="controls">
            <select id="imageSelect">
                <option value="araras2.bmp">Araras</option>
                <option value="flor.bmp">Flor</option>
                <option value="placas.bmp">Placas</option>
                <option value="predio.bmp">Prédio</option>
                <option value="road.bmp">Estrada</option>
            </select>
            <button id="loadBtn">Carregar Imagem</button>
            <button id="applyBtn">Aplicar Canny</button>
        </div>
        <div class="container">
            <div class="image-container">
                <h3>Imagem Original</h3>
                <canvas id="originalCanvas"></canvas>
            </div>
            <div class="image-container">
                <h3>Imagem com Detecção de Bordas</h3>
                <canvas id="cannyCanvas"></canvas>
            </div>
        </div>
    `;
    document.body.appendChild(div);

    const originalCanvas = div.querySelector('#originalCanvas');
    const cannyCanvas = div.querySelector('#cannyCanvas');
    let originalImage = null;

    div.querySelector('#loadBtn').onclick = loadImage;
    div.querySelector('#applyBtn').onclick = applyCanny;

    function loadImage() {
        const imageName = div.querySelector('#imageSelect').value;
        const img = new Image();
        img.src = '../Imagens/' + imageName;
        img.onload = function() {
            originalImage = img;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            cannyCanvas.width = img.width;
            cannyCanvas.height = img.height;

            const ctx = originalCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
        };
    }

    function applyCanny() {
        if (!originalImage) return;

        const ctx = originalCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

        // Pré-processamento: filtro Gaussiano
        const blurredData = applyGaussianBlur(imageData);

        // Conversão para cinza
        const grayData = toGrayscale(blurredData);

        // Aplicar Canny simplificado (usando Sobel e limiares fixos)
        const edgeData = cannySimplified(grayData, 80, 150);

        const outCtx = cannyCanvas.getContext('2d');
        outCtx.putImageData(edgeData, 0, 0);
    }

    function toGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
        }
        return imageData;
    }

    function applyGaussianBlur(imageData) {
        const kernel = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];
        const kernelSum = 16;
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const output = new ImageData(width, height);
        const dst = output.data;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let r = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = (y + ky) * width + (x + kx);
                        r += src[px * 4] * kernel[ky + 1][kx + 1];
                    }
                }
                const i = (y * width + x) * 4;
                const val = r / kernelSum;
                dst[i] = dst[i + 1] = dst[i + 2] = val;
                dst[i + 3] = 255;
            }
        }
        return output;
    }

    function cannySimplified(imageData, lowThreshold, highThreshold) {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const dst = new ImageData(width, height);
        const out = dst.data;

        // Máscaras Sobel
        const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0,
                    sumY = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = (y + ky) * width + (x + kx);
                        const val = src[px * 4];
                        const idx = (ky + 1) * 3 + (kx + 1);
                        sumX += val * gx[idx];
                        sumY += val * gy[idx];
                    }
                }

                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const i = (y * width + x) * 4;
                const edge = magnitude >= highThreshold ? 255 : magnitude >= lowThreshold ? 128 : 0;
                out[i] = out[i + 1] = out[i + 2] = edge;
                out[i + 3] = 255;
            }
        }
        return dst;
    }

    return () => div.remove();
}