function startFiltros(canvas, animFrameIdRef) {
    //    const filtroLaplaciano = [
    // [0, -1, 0], [-1, 4, -1], [0, -1, 0]

    // Função para aplicar convoluçãoinicial
    const originalCanvas = canvas;
    const resultado1Canvas = document.createElement('canvas');
    const resultado2Canvas = document.createElement('canvas');
    const histOriginalCanvas = document.createElement('canvas');
    const hist1Canvas = document.createElement('canvas');
    const hist2Canvas = document.createElement('canvas');

    // Configurar canvases
    [resultado1Canvas, resultado2Canvas].forEach(canvas => {
        canvas.width = 800;
        canvas.height = 300;
        canvas.style.marginTop = '20px';
        document.body.appendChild(canvas);
    });

    [histOriginalCanvas, hist1Canvas, hist2Canvas].forEach(canvas => {
        canvas.width = 256;
        canvas.height = 150;
        canvas.style.marginTop = '10px';
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
            <button onclick="aplicarFiltros()">Aplicar Filtros</button>
        </div>
    `;
    const container = document.querySelector('.container');
    container.insertBefore(controls, originalCanvas);

    let originalImage = null;

    // Definição dos filtros
    const filtroBox = [
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9]
    ];

    const filtroLaplaciano = [
        [0, -1, 0],
        [-1, 4, -1],
        [0, -1, 0]
    ];

    // Filtro passa-alta equivalente à diferença absoluta
    const filtroDiferenca = [
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 8 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9]
    ].map(row => row.map(val => 1 - val)); // Subtrai de 1 para criar o filtro diferença

    // Função para calcular diferença absoluta entre duas imagens
    function calcularDiferencaAbsoluta(imageData1, imageData2) {
        const width = imageData1.width;
        const height = imageData1.height;
        const resultado = new ImageData(new Uint8ClampedArray(imageData1.data), width, height);

        for (let i = 0; i < imageData1.data.length; i += 4) {
            const diff = Math.abs(imageData1.data[i] - imageData2.data[i]);
            resultado.data[i] = diff;
            resultado.data[i + 1] = diff;
            resultado.data[i + 2] = diff;
            resultado.data[i + 3] = 255;
        }
        return resultado;
    }



    // Função para aplicar convolução
    function aplicarConvolucao(imageData, filtro) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const resultado = new ImageData(new Uint8ClampedArray(data), width, height);
        const resultData = resultado.data;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const pixelIndex = (y * width + x) * 4;
                let soma = 0;

                // Aplicar filtro
                for (let fy = -1; fy <= 1; fy++) {
                    for (let fx = -1; fx <= 1; fx++) {
                        const index = ((y + fy) * width + (x + fx)) * 4;
                        soma += data[index] * filtro[fy + 1][fx + 1];
                    }
                }

                resultData[pixelIndex] = soma;
                resultData[pixelIndex + 1] = soma;
                resultData[pixelIndex + 2] = soma;
                resultData[pixelIndex + 3] = 255;
            }
        }

        return resultado;
    }

    // Função para converter para escala de cinza
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

    // Função para desenhar histograma
    function desenharHistograma(imageData, canvas, titulo) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

    // Função para carregar imagem
    window.loadImage = function() {
        const imageName = document.getElementById('imageSelect').value;
        const img = new Image();
        img.src = '../Imagens/' + imageName;
        img.onload = function() {
            originalImage = img;
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            resultado1Canvas.width = img.width;
            resultado1Canvas.height = img.height;
            resultado2Canvas.width = img.width;
            resultado2Canvas.height = img.height;

            const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const grayscaleData = converterParaCinza(imageData);
            ctx.putImageData(grayscaleData, 0, 0);

            desenharHistograma(grayscaleData, histOriginalCanvas, 'Histograma Original');
        };
    };

    // Função para aplicar filtros
    window.aplicarFiltros = function() {
        if (!originalImage) return;

        // Obter contexto e dados da imagem original em escala de cinza
        const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

        // Aplicar h1*(h2*Imagem)
        const ctx1 = resultado1Canvas.getContext('2d', { willReadFrequently: true });
        let resultado1 = aplicarConvolucao(imageData, filtroLaplaciano);
        resultado1 = aplicarConvolucao(resultado1, filtroBox);
        ctx1.putImageData(resultado1, 0, 0);
        desenharHistograma(resultado1, hist1Canvas, 'Histograma Box(Laplaciano)');

        // Aplicar h2*(h1*Imagem)
        const ctx2 = resultado2Canvas.getContext('2d', { willReadFrequently: true });
        let resultado2 = aplicarConvolucao(imageData, filtroBox);
        resultado2 = aplicarConvolucao(resultado2, filtroLaplaciano);
        ctx2.putImageData(resultado2, 0, 0);
        desenharHistograma(resultado2, hist2Canvas, 'Histograma Laplaciano(Box)');
    };

    // Event listener para o botão de carregar imagem
    document.getElementById('loadButton').addEventListener('click', loadImage);

    // Carregar primeira imagem
    loadImage();

    // Retornar função de limpeza
    return function cleanup() {
        [resultado1Canvas, resultado2Canvas, histOriginalCanvas, hist1Canvas, hist2Canvas, controls].forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        delete window.loadImage;
        delete window.aplicarFiltros;
    };
}