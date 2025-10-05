function initializeCanvases() {
    // Configuração dos canvas
    const canvasSize = 256;
    const histHeight = 150;

    // Canvas para os padrões originais
    const xadrezCanvas = document.getElementById('xadrezCanvas');
    const barrasCanvas = document.getElementById('barrasCanvas');
    [xadrezCanvas, barrasCanvas].forEach(canvas => {
        canvas.width = canvasSize;
        canvas.height = canvasSize;
    });

    // Canvas para os histogramas originais
    const xadrezHistCanvas = document.getElementById('xadrezHistCanvas');
    const barrasHistCanvas = document.getElementById('barrasHistCanvas');
    [xadrezHistCanvas, barrasHistCanvas].forEach(canvas => {
        canvas.width = 256;
        canvas.height = histHeight;
    });

    // Canvas para os resultados do filtro
    const xadrezFiltroCanvas = document.getElementById('xadrezFiltroCanvas');
    const barrasFiltroCanvas = document.getElementById('barrasFiltroCanvas');
    [xadrezFiltroCanvas, barrasFiltroCanvas].forEach(canvas => {
        canvas.width = canvasSize;
        canvas.height = canvasSize;
    });

    // Canvas para os histogramas dos resultados
    const xadrezFiltroHistCanvas = document.getElementById('xadrezFiltroHistCanvas');
    const barrasFiltroHistCanvas = document.getElementById('barrasFiltroHistCanvas');
    [xadrezFiltroHistCanvas, barrasFiltroHistCanvas].forEach(canvas => {
        canvas.width = 256;
        canvas.height = histHeight;
    });

    // Criar e desenhar padrões iniciais
    const xadrezPattern = criarPadraoXadrez(canvasSize);
    const barrasPattern = criarPadraoBarras(canvasSize);

    // Desenhar padrões originais
    desenharImageData(xadrezPattern, xadrezCanvas);
    desenharImageData(barrasPattern, barrasCanvas);

    // Desenhar histogramas originais
    desenharHistograma(xadrezPattern, xadrezHistCanvas, 'Histograma Original Xadrez');
    desenharHistograma(barrasPattern, barrasHistCanvas, 'Histograma Original Barras');
}

function criarPadraoXadrez(size) {
    const imageData = new ImageData(size, size);
    const data = imageData.data;
    const squareSize = 32; // Tamanho de cada quadrado do xadrez

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = (y * size + x) * 4;
            const isWhite = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0;
            const value = isWhite ? 255 : 0;

            data[index] = value; // R
            data[index + 1] = value; // G
            data[index + 2] = value; // B
            data[index + 3] = 255; // A
        }
    }
    return imageData;
}

function criarPadraoBarras(size) {
    const imageData = new ImageData(size, size);
    const data = imageData.data;
    const halfSize = Math.floor(size / 2);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = (y * size + x) * 4;
            const value = x < halfSize ? 0 : 255;

            data[index] = value; // R
            data[index + 1] = value; // G
            data[index + 2] = value; // B
            data[index + 3] = 255; // A
        }
    }
    return imageData;
}

function aplicarFiltroMedia(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const resultado = new ImageData(width, height);
    const data = imageData.data;
    const resultData = resultado.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            let soma = 0;
            let count = 0;

            // Aplicar filtro da média 3x3
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;

                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const idx = (ny * width + nx) * 4;
                        soma += data[idx];
                        count++;
                    }
                }
            }

            const media = Math.round(soma / count);
            resultData[pixelIndex] = media;
            resultData[pixelIndex + 1] = media;
            resultData[pixelIndex + 2] = media;
            resultData[pixelIndex + 3] = 255;
        }
    }

    return resultado;
}

function desenharHistograma(imageData, canvas, titulo) {
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

    // Desenhar título
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(titulo, 5, 15);

    // Desenhar histograma
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let i = 0; i < 256; i++) {
        const height = (histogram[i] / max) * (canvas.height - 20);
        ctx.moveTo(i, canvas.height);
        ctx.lineTo(i, canvas.height - height);
    }
    ctx.stroke();
}

function desenharImageData(imageData, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
}

// Função para ser chamada pelo botão
window.aplicarFiltroMediaNosPatroes = function() {
    // Obter os canvas originais
    const xadrezCanvas = document.getElementById('xadrezCanvas');
    const barrasCanvas = document.getElementById('barrasCanvas');

    // Obter os canvas para resultados filtrados
    const xadrezFiltroCanvas = document.getElementById('xadrezFiltroCanvas');
    const barrasFiltroCanvas = document.getElementById('barrasFiltroCanvas');

    // Aplicar filtro no padrão xadrez
    const ctxXadrez = xadrezCanvas.getContext('2d');
    const imageDataXadrez = ctxXadrez.getImageData(0, 0, xadrezCanvas.width, xadrezCanvas.height);
    const resultadoXadrez = aplicarFiltroMedia(imageDataXadrez);

    // Aplicar filtro no padrão de barras
    const ctxBarras = barrasCanvas.getContext('2d');
    const imageDataBarras = ctxBarras.getImageData(0, 0, barrasCanvas.width, barrasCanvas.height);
    const resultadoBarras = aplicarFiltroMedia(imageDataBarras);

    // Desenhar resultados
    desenharImageData(resultadoXadrez, xadrezFiltroCanvas);
    desenharImageData(resultadoBarras, barrasFiltroCanvas);

    // Desenhar histogramas dos resultados
    desenharHistograma(resultadoXadrez, document.getElementById('xadrezFiltroHistCanvas'), 'Histograma Xadrez Filtrado');
    desenharHistograma(resultadoBarras, document.getElementById('barrasFiltroHistCanvas'), 'Histograma Barras Filtrado');
};