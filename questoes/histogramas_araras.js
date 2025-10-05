function initializeCanvases() {
    // Configuração dos canvas
    const canvasWidth = 800;
    const canvasHeight = 600;
    const histHeight = 150;

    // Canvas para as imagens originais
    const arara1Canvas = document.getElementById('arara1Canvas');
    const arara2Canvas = document.getElementById('arara2Canvas');
    [arara1Canvas, arara2Canvas].forEach(canvas => {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });

    // Canvas para os histogramas originais
    const arara1HistCanvas = document.getElementById('arara1HistCanvas');
    const arara2HistCanvas = document.getElementById('arara2HistCanvas');
    [arara1HistCanvas, arara2HistCanvas].forEach(canvas => {
        canvas.width = 256;
        canvas.height = histHeight;
    });

    // Canvas para os resultados do filtro
    const arara1FiltroCanvas = document.getElementById('arara1FiltroCanvas');
    const arara2FiltroCanvas = document.getElementById('arara2FiltroCanvas');
    [arara1FiltroCanvas, arara2FiltroCanvas].forEach(canvas => {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });

    // Canvas para os histogramas dos resultados
    const arara1FiltroHistCanvas = document.getElementById('arara1FiltroHistCanvas');
    const arara2FiltroHistCanvas = document.getElementById('arara2FiltroHistCanvas');
    [arara1FiltroHistCanvas, arara2FiltroHistCanvas].forEach(canvas => {
        canvas.width = 256;
        canvas.height = histHeight;
    });

    // Carregar e desenhar imagens iniciais
    carregarImagem('arara1', '../Imagens/araras1.bmp', arara1Canvas, arara1HistCanvas);
    carregarImagem('arara2', '../Imagens/araras2.bmp', arara2Canvas, arara2HistCanvas);
}

function carregarImagem(id, src, canvas, histCanvas) {
    const img = new Image();
    img.src = src;
    img.onload = function() {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Converter para escala de cinza e desenhar histograma
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const grayscaleData = converterParaCinza(imageData);
        ctx.putImageData(grayscaleData, 0, 0);
        desenharHistograma(grayscaleData, histCanvas, `Histograma Original ${id}`);
    };
}

function converterParaCinza(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
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
window.aplicarFiltroMediaNasAraras = function() {
    // Obter os canvas originais
    const arara1Canvas = document.getElementById('arara1Canvas');
    const arara2Canvas = document.getElementById('arara2Canvas');

    // Obter os canvas para resultados filtrados
    const arara1FiltroCanvas = document.getElementById('arara1FiltroCanvas');
    const arara2FiltroCanvas = document.getElementById('arara2FiltroCanvas');

    // Aplicar filtro na arara1
    const ctxArara1 = arara1Canvas.getContext('2d');
    const imageDataArara1 = ctxArara1.getImageData(0, 0, arara1Canvas.width, arara1Canvas.height);
    const resultadoArara1 = aplicarFiltroMedia(imageDataArara1);

    // Aplicar filtro na arara2
    const ctxArara2 = arara2Canvas.getContext('2d');
    const imageDataArara2 = ctxArara2.getImageData(0, 0, arara2Canvas.width, arara2Canvas.height);
    const resultadoArara2 = aplicarFiltroMedia(imageDataArara2);

    // Desenhar resultados
    desenharImageData(resultadoArara1, arara1FiltroCanvas);
    desenharImageData(resultadoArara2, arara2FiltroCanvas);

    // Desenhar histogramas dos resultados
    desenharHistograma(resultadoArara1, document.getElementById('arara1FiltroHistCanvas'), 'Histograma Arara1 Filtrado');
    desenharHistograma(resultadoArara2, document.getElementById('arara2FiltroHistCanvas'), 'Histograma Arara2 Filtrado');
};