function startProcessamento(canvas, animFrameIdRef) {
    const originalCanvas = canvas;
    const processedCanvas = document.createElement('canvas');
    const histogramCanvas = document.createElement('canvas');

    // Configurar os canvas
    [processedCanvas, histogramCanvas].forEach(canvas => {
        canvas.width = 800;
        canvas.height = 300;
        canvas.style.marginTop = '20px';
        document.body.appendChild(canvas);
    });

    // Adicionar controles
    const controls = document.createElement('div');
    controls.style.margin = '20px';
    controls.style.textAlign = 'center';
    controls.innerHTML = `
        <div>
            <select id="imageSelect">
                <option value="araras2.bmp">Araras</option>
                <option value="flor.bmp">Flor</option>
                <option value="placas.bmp">Placas</option>
                <option value="predio.bmp">Prédio</option>
                <option value="road.bmp">Estrada</option>
            </select>
            <button id="loadButton">Carregar Imagem</button>
        </div>
        <div style="margin: 20px">
            <p><b>Operações de Brilho:</b></p>
            <button onclick="applyOperation('brilho', 1)">Aumentar Brilho (+50)</button>
            <button onclick="applyOperation('brilho', -1)">Diminuir Brilho (-50)</button>
            <button onclick="applyOperation('brilho_mult', 1.5)">Brilho Multiplicativo (×1.5)</button>
        </div>
        <div style="margin: 20px">
            <p><b>Operações de Contraste:</b></p>
            <button onclick="applyOperation('contraste', 1.5)">Aumentar Contraste (×1.5)</button>
            <button onclick="applyOperation('contraste', 0.7)">Diminuir Contraste (×0.7)</button>
            <button onclick="applyOperation('equalizar')">Equalizar Histograma</button>
        </div>
        <button onclick="resetImage()">Resetar Imagem</button>
    `;
    document.body.insertBefore(controls, originalCanvas);

    let originalImage = null;

    // Função para carregar imagem
    window.loadImage = function() {
        const imageName = document.getElementById('imageSelect').value;
        const img = new Image();
        img.src = '../Imagens/' + imageName;
        img.onload = function() {
            originalImage = img;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            processedCanvas.width = img.width;
            processedCanvas.height = img.height;

            const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            resetImage();
        };
    };

    // Função para desenhar histograma
    function drawHistogram(imageData) {
        const ctx = histogramCanvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);

        // Arrays para R, G, B
        const histR = new Array(256).fill(0);
        const histG = new Array(256).fill(0);
        const histB = new Array(256).fill(0);

        // Contar pixels
        for (let i = 0; i < imageData.data.length; i += 4) {
            histR[imageData.data[i]]++;
            histG[imageData.data[i + 1]]++;
            histB[imageData.data[i + 2]]++;
        }

        // Normalizar
        const max = Math.max(
            Math.max(...histR),
            Math.max(...histG),
            Math.max(...histB)
        );

        // Desenhar histograma
        function drawChannel(hist, color) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            for (let i = 0; i < 256; i++) {
                const h = (hist[i] / max) * histogramCanvas.height;
                ctx.moveTo(i * 3, histogramCanvas.height);
                ctx.lineTo(i * 3, histogramCanvas.height - h);
            }
            ctx.stroke();
        }

        drawChannel(histR, 'rgba(255,0,0,0.5)');
        drawChannel(histG, 'rgba(0,255,0,0.5)');
        drawChannel(histB, 'rgba(0,0,255,0.5)');
    }

    // Função para resetar imagem
    window.resetImage = function() {
        if (!originalImage) return;
        const ctx = processedCanvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
        drawHistogram(imageData);
    };

    // Função para aplicar operações
    window.applyOperation = function(type, value) {
        if (!originalImage) return;

        const ctx = processedCanvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
        const data = imageData.data;

        switch (type) {
            case 'brilho':
                // Brilho aditivo
                const delta = value * 50;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, data[i] + delta));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + delta));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + delta));
                }
                break;

            case 'brilho_mult':
                // Brilho multiplicativo
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * value);
                    data[i + 1] = Math.min(255, data[i + 1] * value);
                    data[i + 2] = Math.min(255, data[i + 2] * value);
                }
                break;

            case 'contraste':
                // Contraste
                const factor = value;
                const center = 128;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, center + (data[i] - center) * factor));
                    data[i + 1] = Math.min(255, Math.max(0, center + (data[i + 1] - center) * factor));
                    data[i + 2] = Math.min(255, Math.max(0, center + (data[i + 2] - center) * factor));
                }
                break;

            case 'equalizar':
                // Equalização de histograma para cada canal
                const channels = [
                    [],
                    [],
                    []
                ];
                for (let i = 0; i < data.length; i += 4) {
                    channels[0].push(data[i]);
                    channels[1].push(data[i + 1]);
                    channels[2].push(data[i + 2]);
                }

                channels.forEach((channel, idx) => {
                    const hist = new Array(256).fill(0);
                    channel.forEach(v => hist[v]++);

                    const cdf = new Array(256);
                    cdf[0] = hist[0];
                    for (let i = 1; i < 256; i++) {
                        cdf[i] = cdf[i - 1] + hist[i];
                    }

                    const cdfMin = cdf.find(x => x > 0);
                    const range = channel.length - cdfMin;

                    for (let i = 0; i < channel.length; i++) {
                        const newValue = Math.round((cdf[channel[i]] - cdfMin) * 255 / range);
                        data[i * 4 + idx] = newValue;
                    }
                });
                break;
        }

        ctx.putImageData(imageData, 0, 0);
        drawHistogram(imageData);
    };

    // Event listener para o botão de carregar imagem
    document.getElementById('loadButton').addEventListener('click', loadImage);

    // Carregar primeira imagem
    loadImage();

    // Retornar função de limpeza
    return function cleanup() {
        [processedCanvas, histogramCanvas, controls].forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        // Remover funções globais
        delete window.loadImage;
        delete window.resetImage;
        delete window.applyOperation;
    };
}