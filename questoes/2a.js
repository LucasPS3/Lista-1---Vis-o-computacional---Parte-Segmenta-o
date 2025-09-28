function startQuestao2(canvas, animFrameIdRef) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parâmetros
    const comprimentoBraco = 2 * 60; // escala para visualização
    const comprimentoAntebraco = 3 * 60;
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2 + 100;

    const duracao = 2; // segundos
    const fps = 60;
    const totalFrames = duracao * fps;

    // Ângulos iniciais e finais (em radianos)
    const anguloBracoInicial = -Math.PI / 2; // vertical para cima
    const anguloBracoFinal = 0; // horizontal para direita
    const anguloAntebracoInicial = -Math.PI / 2; // alinhado com braço
    const anguloAntebracoFinal = Math.PI / 2; // horizontal para direita

    let frame = 0;

    function desenharBraco(anguloBraco, anguloAntebraco) {
        ctx.save();
        ctx.translate(centroX, centroY);

        // Braço
        ctx.rotate(anguloBraco);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -comprimentoBraco);
        ctx.lineWidth = 15;
        ctx.strokeStyle = "#3498db";
        ctx.stroke();

        // Antebraço
        ctx.save();
        ctx.translate(0, -comprimentoBraco);
        ctx.rotate(anguloAntebraco - anguloBraco);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -comprimentoAntebraco);
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#e74c3c";
        ctx.stroke();
        ctx.restore();

        // Junta do braço
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        // Junta do cotovelo
        ctx.save();
        ctx.translate(0, -comprimentoBraco);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    function atualizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Interpolação linear dos ângulos
        const t = Math.min(frame / totalFrames, 1);
        const anguloBraco = anguloBracoInicial + (anguloBracoFinal - anguloBracoInicial) * t;
        const anguloAntebraco = anguloAntebracoInicial + (anguloAntebracoFinal - anguloAntebracoInicial) * t * 2;

        desenharBraco(anguloBraco, anguloAntebraco);

        frame++;
        if (frame <= totalFrames) {
            animFrameIdRef.id = requestAnimationFrame(atualizar);
        }
    }

    atualizar();
}
