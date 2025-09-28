function startQuestao3a(canvas, animFrameIdRef) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const R = 100; // raio do círculo maior
    const r = 25;  // raio do círculo menor
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const periodo = 4; // segundos por volta
    const fps = 60;
    const totalFrames = periodo * fps;

    let frame = 0;

    function desenharCenario(angulo, anguloRoda) {
        ctx.save();
        ctx.translate(cx, cy);

        // Círculo maior (parede interna)
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Posição do centro do círculo menor
        const theta = angulo; // ângulo de rotação ao redor do círculo maior
        const x = (R - r) * Math.cos(theta);
        const y = (R - r) * Math.sin(theta);

        // Círculo menor (rolando)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(anguloRoda);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#e67e22";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Marca um ponto fixo no círculo menor
        ctx.beginPath();
        ctx.arc(0, -r, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#c0392b";
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }

    function atualizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ângulo do centro do círculo menor ao redor do maior
        const t = frame / totalFrames;
        const angulo = t * 2 * Math.PI; // volta completa em 4s

        // Rolamento sem deslizar: Δθ_roda = - (R - r)/r * Δθ_centro
        // Para rolamento interno, o círculo menor gira mais rápido e no sentido oposto
        const anguloRoda = -((R - r) / r) * angulo;

        desenharCenario(angulo, anguloRoda);

        frame++;
        if (frame <= totalFrames) {
            animFrameIdRef.id = requestAnimationFrame(atualizar);
        } else {
            frame = 0; // reinicia animação
            animFrameIdRef.id = requestAnimationFrame(atualizar);
        }
    }

    atualizar();
}
