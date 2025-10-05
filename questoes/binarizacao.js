function startBinarizacao(canvas, animFrameIdRef) {
    // Configuração inicial do canvas
    canvas.style.background = '#fff';
    const originalCanvas = canvas;
    const binaryCanvas = document.createElement('canvas');
    const originalHistogram = document.createElement('canvas');
    const binaryHistogram = document.createElement('canvas');

    // Configurar os novos elementos
    [binaryCanvas, originalHistogram, binaryHistogram].forEach(canvas => {
        canvas.width = 800;
        canvas.height = 300;
        canvas.style.background = '#fff';
        canvas.style.marginTop = '20px';
        document.body.appendChild(canvas);
    });

    // Adicionar controles
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.style.textAlign = 'center';
    controls.style.marginBottom = '20px';
    controls.innerHTML = `
        <select id="imageSelect">
            <option value="araras2.bmp">Araras</option>
            <option value="flor.bmp">Flor</option>
            <option value="placas.bmp">Placas</option>
            <option value="predio.bmp">Prédio</option>
            <option value="road.bmp">Estrada</option>
        </select>
        <button id="loadButton">Carregar Imagem</button>
        <div class="slider-container" style="margin: 10px 0">
            <label for="threshold">Limiar: </label>
            <input type="range" id="threshold" min="0" max="255" value="128">
            <span id="thresholdValue">128</span>
        </div>
        <select id="method">
            <option value="fixed">Limiar Fixo</option>
            <option value="otsu">Método de Otsu</option>
        </select>
    `;
    document.body.insertBefore(controls, originalCanvas);

    let originalImage = null;
    const thresholdSlider = controls.querySelector('#threshold');
    const thresholdValue = controls.querySelector('#thresholdValue');

    function loadImage() {
        const imageName = controls.querySelector('#imageSelect').value;
        const img = new Image();
        img.src = '../Imagens/' + imageName;
        img.onload = function() {
            originalImage = img;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            binaryCanvas.width = img.width;
            binaryCanvas.height = img.height;
            originalHistogram.width = 256;
            originalHistogram.height = 150;
            binaryHistogram.width = 256;
            binaryHistogram.height = 150;

            const ctx = originalCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const grayscaleData = convertToGrayscale(imageData);
            ctx.putImageData(grayscaleData, 0, 0);

            drawHistogram(grayscaleData, originalHistogram);
            updateBinarization();
        };
    }

    function convertToGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        return imageData;
    }

    function drawHistogram(imageData, canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calcular histograma
        const histogram = new Array(256).fill(0);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            histogram[data[i]]++;
        }

        // Encontrar valor máximo para normalização
        const max = Math.max(...histogram);

        // Desenhar histograma
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        for (let i = 0; i < 256; i++) {
            const height = (histogram[i] / max) * canvas.height;
            ctx.moveTo(i, canvas.height);
            ctx.lineTo(i, canvas.height - height);
        }
        ctx.stroke();
    }

    function calculateOtsuThreshold(imageData) {
        const histogram = new Array(256).fill(0);
        const data = imageData.data;
        let pixelCount = data.length / 4;

        // Calcular histograma
        for (let i = 0; i < data.length; i += 4) {
            histogram[data[i]]++;
        }

        let sum = 0;
        for (let i = 0; i < 256; i++) {
            sum += i * histogram[i];
        }

        let sumB = 0;
        let wB = 0;
        let wF = 0;
        let maxVariance = 0;
        let threshold = 0;

        for (let t = 0; t < 256; t++) {
            wB += histogram[t];
            if (wB === 0) continue;

            wF = pixelCount - wB;
            if (wF === 0) break;

            sumB += t * histogram[t];
            let mB = sumB / wB;
            let mF = (sum - sumB) / wF;

            let variance = wB * wF * (mB - mF) * (mB - mF);

            if (variance > maxVariance) {
                maxVariance = variance;
                threshold = t;
            }
        }

        return threshold;
    }

    function binarizeImage(imageData, threshold) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > threshold ? 255 : 0;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
        return imageData;
    }

    function updateBinarization() {
        if (!originalImage) return;

        const ctx = originalCanvas.getContext('2d');
        const originalImageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        const binaryCtx = binaryCanvas.getContext('2d');
        const binaryImageData = new ImageData(
            new Uint8ClampedArray(originalImageData.data),
            originalImageData.width,
            originalImageData.height
        );

        let threshold;
        if (controls.querySelector('#method').value === 'otsu') {
            threshold = calculateOtsuThreshold(originalImageData);
            thresholdSlider.value = threshold;
            thresholdValue.textContent = threshold;
        } else {
            threshold = parseInt(thresholdSlider.value);
        }

        const binarizedData = binarizeImage(binaryImageData, threshold);
        binaryCtx.putImageData(binarizedData, 0, 0);
        drawHistogram(binarizedData, binaryHistogram);
    }

    // Event Listeners
    controls.querySelector('#loadButton').addEventListener('click', loadImage);
    thresholdSlider.addEventListener('input', function() {
        thresholdValue.textContent = this.value;
        if (controls.querySelector('#method').value === 'fixed') {
            updateBinarization();
        }
    });
    controls.querySelector('#method').addEventListener('change', updateBinarization);

    // Inicializar
    loadImage();

    // Cleanup function
    return function cleanup() {
        // Remover elementos criados dinamicamente
        [binaryCanvas, originalHistogram, binaryHistogram, controls].forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    };
}