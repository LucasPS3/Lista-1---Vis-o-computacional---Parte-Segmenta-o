// questao1.js

function startQuestao1(canvas, animFrameIdRef) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parâmetros da bola
    const raio = 30;
    let x = raio;
    let y = canvas.height - raio;
    let vx = 0;
    let vy = -10;
    const gravidade = 0.5;

    // Parâmetros do movimento
    const periodo = 4;
    const fps = 60;
    const totalFrames = periodo * fps;
    const distanciaHorizontal = canvas.width - 2 * raio;
    vx = (2 * distanciaHorizontal) / totalFrames;

    let indo = true;

    function desenharBola() {
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fillStyle = "#f00";
        ctx.fill();
        ctx.closePath();
    }

    function atualizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        x += vx * (indo ? 1 : -1);
        y += vy;
        vy += gravidade;

        if (y + raio > canvas.height) {
            y = canvas.height - raio;
            vy *= -1;
        }
        if (y - raio < 0) {
            y = raio;
            vy *= -1;
        }
        if (x + raio > canvas.width) {
            x = canvas.width - raio;
            indo = false;
        }
        if (x - raio < 0) {
            x = raio;
            indo = true;
        }

        desenharBola();
        animFrameIdRef.id = requestAnimationFrame(atualizar);
    }

    atualizar();
}