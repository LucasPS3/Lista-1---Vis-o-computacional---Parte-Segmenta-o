function startCanny(canvas, animFrameIdRef) {
    // Canvas principal (original) já provido; vamos criar o canvas de resultado
    canvas.style.background = "#fff";
    const resultCanvas = document.createElement("canvas");
    resultCanvas.style.marginTop = "10px";
    document.body.appendChild(resultCanvas);

    // Controls
    const controls = document.createElement("div");
    controls.className = "controls";
    controls.style.textAlign = "center";
    controls.style.marginBottom = "20px";
    controls.innerHTML = `
        <select id="imageSelect">
            <option value="canguru.bmp">Canguru</option>
            <option value="indio.bmp">Índio</option>
            <option value="cavalo.bmp">Cavalo</option>
            <option value="tigre.bmp">Tigre</option>
        </select>
        <button id="loadButton">Carregar Imagem</button>
        <div style="margin:10px 0">
            <label>Pré-processamento (Gaussiano 5x5):</label>
            <input type="checkbox" id="preproc" checked>
        </div>
        <div style="margin:6px 0">
            <label>Limite Inferior:</label>
            <input type="range" id="lowThreshold" min="0" max="255" value="50">
            <span id="lowValue">50</span>
        </div>
        <div style="margin:6px 0">
            <label>Limite Superior:</label>
            <input type="range" id="highThreshold" min="0" max="255" value="150">
            <span id="highValue">150</span>
        </div>
        <button id="applyButton">Aplicar (mesmos parâmetros)</button>
        <button id="applyNoPreproc">Aplicar (sem pré-processamento)</button>
    `;
    document.body.insertBefore(controls, canvas);

    // Referências e estados
    const originalCanvas = canvas;
    const ctxOriginal = originalCanvas.getContext("2d");
    const ctxResult = resultCanvas.getContext("2d");
    let originalImage = null;

    // ---------- Utilitários ----------
    function loadImage() {
        const imageName = controls.querySelector('#imageSelect').value;
        const img = new Image();
        img.src = '../Imagens/' + imageName;
        img.onload = function() {
            originalImage = img;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            resultCanvas.width = img.width;
            resultCanvas.height = img.height;
            ctxOriginal.drawImage(img, 0, 0);
        };
    }

    function toGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
        }
        return imageData;
    }

    // Convolução genérica (suporta kernels ímpares)
    function convolveFloat32(srcGray, width, height, kernel, kSize) {
        const half = Math.floor(kSize / 2);
        const out = new Float32Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let acc = 0;
                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        const ix = Math.min(width - 1, Math.max(0, x + kx));
                        const iy = Math.min(height - 1, Math.max(0, y + ky));
                        const kval = kernel[(ky + half) * kSize + (kx + half)];
                        acc += srcGray[iy * width + ix] * kval;
                    }
                }
                out[y * width + x] = acc;
            }
        }
        return out;
    }

    // Kernel Gaussiano 5x5 (sigma ~1.0) - normalizado
    const gaussian5x5 = [
        1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273,
        4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273,
        7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273,
        4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273,
        1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273
    ];

    // Aplica Sobel (gera magnitude)
    function sobelMagnitude(grayFloat, width, height) {
        const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        const mag = new Float32Array(width * height);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0,
                    sumY = 0,
                    k = 0;
                for (let j = -1; j <= 1; j++) {
                    for (let i = -1; i <= 1; i++) {
                        const v = grayFloat[(y + j) * width + (x + i)];
                        sumX += gxKernel[k] * v;
                        sumY += gyKernel[k] * v;
                        k++;
                    }
                }
                mag[y * width + x] = Math.hypot(sumX, sumY);
            }
        }
        return mag;
    }

    // Converte float magnitude para ImageData (map para 0-255)
    function magToImageData(mag, width, height) {
        // Encontrar max
        let max = 0;
        for (let i = 0; i < mag.length; i++)
            if (mag[i] > max) max = mag[i];
        const out = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < mag.length; i++) {
            const v = max === 0 ? 0 : Math.round((mag[i] / max) * 255);
            out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
            out[i * 4 + 3] = 255;
        }
        return new ImageData(out, width, height);
    }

    // Versão simplificada do "Canny": Sobel -> threshold hysteresis simplificado
    function applyCannyPipeline(usePreproc, lowT, highT) {
        if (!originalImage) return;
        // 1) pegar imagem e grayscale
        const w = originalCanvas.width,
            h = originalCanvas.height;
        const imageData = ctxOriginal.getImageData(0, 0, w, h);
        const grayImageData = toGrayscale(imageData);
        // construir array float gray (1 canal)
        const grayFloat = new Float32Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                grayFloat[y * w + x] = grayImageData.data[(y * w + x) * 4];
            }
        }

        // 2) Pré-processamento (se selecionado) — Gaussian blur 5x5
        let processedGray = grayFloat;
        if (usePreproc) {
            processedGray = convolveFloat32(grayFloat, w, h, gaussian5x5, 5);
        }

        // 3) Gradiente (Sobel) -> magnitude
        const magnitude = sobelMagnitude(processedGray, w, h);

        // 4) Histerese simplificada: marca 255 se mag>high, 0 se <low, 127 se intermediário
        const out = new Uint8ClampedArray(w * h * 4);
        for (let i = 0; i < magnitude.length; i++) {
            const m = Math.round(magnitude[i]);
            const v = m > highT ? 255 : (m < lowT ? 0 : 127);
            out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
            out[i * 4 + 3] = 255;
        }

        // 5) Opcional: converter intermediários (127) para 255 se conectados a fortes (simples morfologia)
        // (implementação curta: para cada 127, se vizinho 255 então vira 255)
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                if (out[idx] === 127) {
                    let foundStrong = false;
                    for (let j = -1; j <= 1; j++) {
                        for (let i = -1; i <= 1; i++) {
                            const nIdx = ((y + j) * w + (x + i)) * 4;
                            if (out[nIdx] === 255) { foundStrong = true; break; }
                        }
                        if (foundStrong) break;
                    }
                    if (foundStrong) out[idx] = out[idx + 1] = out[idx + 2] = 255;
                    else out[idx] = out[idx + 1] = out[idx + 2] = 0;
                }
            }
        }

        const resultImage = new ImageData(out, w, h);
        ctxResult.putImageData(resultImage, 0, 0);
    }

    // ---------- Eventos ----------
    controls.querySelector('#loadButton').addEventListener('click', loadImage);
    controls.querySelector('#applyButton').addEventListener('click', function() {
        const low = parseInt(controls.querySelector('#lowThreshold').value);
        const high = parseInt(controls.querySelector('#highThreshold').value);
        const usePreproc = controls.querySelector('#preproc').checked;
        applyCannyPipeline(usePreproc, low, high);
    });
    controls.querySelector('#applyNoPreproc').addEventListener('click', function() {
        const low = parseInt(controls.querySelector('#lowThreshold').value);
        const high = parseInt(controls.querySelector('#highThreshold').value);
        applyCannyPipeline(false, low, high);
    });

    controls.querySelector('#lowThreshold').addEventListener('input', function(e) {
        controls.querySelector('#lowValue').textContent = e.target.value;
    });
    controls.querySelector('#highThreshold').addEventListener('input', function(e) {
        controls.querySelector('#highValue').textContent = e.target.value;
    });

    // Carregar primeira imagem ao iniciar
    loadImage();

    // Cleanup
    return function cleanup() {
        [controls, resultCanvas].forEach(el => { if (el && el.parentNode) el.parentNode.removeChild(el); });
    };
}