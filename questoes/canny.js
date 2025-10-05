function startCanny(canvas, animFrameIdRef) {
    canvas.style.background = "#fff";

    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    document.body.appendChild(resultCanvas);

    // Controles
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
            <label>Limite Inferior:</label>
            <input type="range" id="lowThreshold" min="0" max="255" value="50">
            <span id="lowValue">50</span>
        </div>
        <div style="margin:10px 0">
            <label>Limite Superior:</label>
            <input type="range" id="highThreshold" min="0" max="255" value="150">
            <span id="highValue">150</span>
        </div>
        <button id="applyButton">Aplicar Canny</button>
    `;
    document.body.insertBefore(controls, canvas);

    let originalImage = null;

    const ctxOriginal = canvas.getContext("2d");
    const ctxResult = resultCanvas.getContext("2d");

    // Funções auxiliares
    function loadImage() {
        const imageName = document.getElementById("imageSelect").value;
        const img = new Image();
        img.src = "../Imagens/" + imageName;
        img.onload = function() {
            originalImage = img;
            canvas.width = img.width;
            canvas.height = img.height;
            resultCanvas.width = img.width;
            resultCanvas.height = img.height;
            ctxOriginal.drawImage(img, 0, 0);
        };
    }

    function toGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        return imageData;
    }

    // --- Implementação simplificada do Canny ---
    function applyCanny(lowThreshold, highThreshold) {
        if (!originalImage) return;

        const imageData = ctxOriginal.getImageData(0, 0, canvas.width, canvas.height);
        const grayData = toGrayscale(imageData);
        const width = grayData.width;
        const height = grayData.height;
        const data = grayData.data;

        // Passo 1: Aplicar filtro de Sobel (gradiente)
        const sobelData = new Uint8ClampedArray(data.length);
        const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        function getPixel(x, y, c) {
            return data[(y * width + x) * 4 + c];
        }

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0,
                    sumY = 0;
                let k = 0;
                for (let j = -1; j <= 1; j++) {
                    for (let i = -1; i <= 1; i++) {
                        const pixel = getPixel(x + i, y + j, 0);
                        sumX += gx[k] * pixel;
                        sumY += gy[k] * pixel;
                        k++;
                    }
                }
                const mag = Math.sqrt(sumX * sumX + sumY * sumY);
                const val = mag > highThreshold ? 255 : mag < lowThreshold ? 0 : 127;
                const idx = (y * width + x) * 4;
                sobelData[idx] = sobelData[idx + 1] = sobelData[idx + 2] = val;
                sobelData[idx + 3] = 255;
            }
        }

        const edgeImage = new ImageData(sobelData, width, height);
        ctxResult.putImageData(edgeImage, 0, 0);
    }

    // Eventos
    document.getElementById("loadButton").addEventListener("click", loadImage);
    document.getElementById("applyButton").addEventListener("click", function() {
        const low = parseInt(document.getElementById("lowThreshold").value);
        const high = parseInt(document.getElementById("highThreshold").value);
        applyCanny(low, high);
    });

    document.getElementById("lowThreshold").addEventListener("input", (e) => {
        document.getElementById("lowValue").textContent = e.target.value;
    });
    document.getElementById("highThreshold").addEventListener("input", (e) => {
        document.getElementById("highValue").textContent = e.target.value;
    });

    // Inicializa
    loadImage();

    // Cleanup
    return function cleanup() {
        [controls, resultCanvas].forEach(el => el.remove());
    };
}