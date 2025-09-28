function startQuestao2b(canvas, animFrameIdRef) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parâmetros da animação
    const periodoSemiCirculo = 4; // segundos
    const fps = 60;
    const framesPerSemiCircle = periodoSemiCirculo * fps;

    // Estado inicial
    let raioAtual = 20; // raio inicial
    let centroX = canvas.width / 2; // centro do canvas
    let centroY = canvas.height / 2;
    let frame = 0;
    let numSemiCirculos = 0;

    function desenharParticula(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#3498db";
        ctx.fill();
        ctx.closePath();
    }

    function desenharTrajetoria() {
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;

        // Desenha os semicírculos já completados
        for (let i = 0; i < numSemiCirculos; i++) {
            const r = 20 * Math.pow(2, Math.floor(i / 2));
            const startAngle = i % 2 === 0 ? Math.PI : 0;
            const endAngle = i % 2 === 0 ? 0 : Math.PI;

            ctx.beginPath();
            ctx.arc(centroX, centroY, r, startAngle, endAngle, false);
            ctx.stroke();
        }
    }

    function atualizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calcula o ângulo atual no semicírculo
        const progress = (frame % framesPerSemiCircle) / framesPerSemiCircle;
        numSemiCirculos = Math.floor(frame / framesPerSemiCircle);
        raioAtual = 20 * Math.pow(2, Math.floor(numSemiCirculos / 2));

        // Determina se estamos no semicírculo superior ou inferior
        const isUpperHalf = numSemiCirculos % 2 === 0;

        // Calcula a posição da partícula
        const angle = isUpperHalf ?
            Math.PI - (progress * Math.PI) : // superior: de π a 0
            progress * Math.PI; // inferior: de 0 a π

        const x = centroX + raioAtual * Math.cos(angle);
        const y = centroY + raioAtual * Math.sin(angle);

        // Desenha a trajetória e a partícula
        desenharTrajetoria();
        desenharParticula(x, y);

        frame++;
        animFrameIdRef.id = requestAnimationFrame(atualizar);
    }

    atualizar();
}