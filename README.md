# Lista 2 - Canvas Animation

Este projeto contém animações desenvolvidas para a disciplina de Computação Gráfica, utilizando HTML Canvas e JavaScript puro para animações 2D, e Three.js para animação 3D.

## Estrutura

- **index.html**  
  Página principal com botões para acessar cada questão. Utiliza um único `<canvas>` para as animações 2D e um `<iframe>` para exibir a animação 3D.

- **questoes/**  
  Pasta contendo os scripts de cada questão:
  - `1.js`: Bola quicando com gravidade e colisão elástica.
  - `2a.js`: Animação de braço e antebraço articulados.
  - `2b.js`: Animação de partícula em semicírculos crescentes.
  - `3a.js`: Círculo menor rolando sem deslizar dentro de um círculo maior (2D).
  - `3b.html`: Animação 3D usando Three.js, com círculo maior rotacionado e círculo menor rolando sem deslizar.

## Como usar

1. Abra o arquivo `index.html` em seu navegador.
2. Utilize os botões para alternar entre as animações das questões 1, 2a, 2b, 3a (todas em 2D).
3. Para a questão 3b (3D), clique no botão correspondente para abrir a animação em uma nova aba.

## Requisitos

- Navegador moderno com suporte a HTML5 e WebGL.
- Para a animação 3D (Questão 3b), é utilizado o [Three.js](https://threejs.org/) via CDN.

## Observações

- O canvas é reutilizado para todas as animações 2D, garantindo organização e eficiência.
- A animação 3D é isolada em um arquivo HTML próprio para evitar conflitos de contexto do canvas.