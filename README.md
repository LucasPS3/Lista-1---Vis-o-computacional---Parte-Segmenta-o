# Lista 1- Visão Computacional Parte 2 - Segmentação

Este projeto contém questões resolvidas da lista 1,Parte 2:Segmentação, para a disciplina de Visão computacional, utilizando HTML Canvas e JavaScript puro.

## Estrutura

- **index.html**  
  Página principal com botões para acessar cada questão.

## Resumo Geral de Uso das Abas

**Canny – Grupo 1 (canny.html)**

Passos:

Selecione uma imagem do Grupo 1 no dropdown.

Ajuste os thresholds low e high para o Canny.

Clique em Aplicar Canny.

Resultado:

Mostra a imagem original e a detecção de bordas.

Permite testar diferentes thresholds e comparar resultados.


**Mean Shift + Canny – Grupo 1 (meanshift_canny_grupo1.html)**

Passos:

Selecione uma imagem do Grupo 1.

Ajuste os parâmetros hs (raio espacial) e hr (raio de cor) do Mean Shift.

Ajuste os thresholds low e high do Canny.

Clique em Aplicar Mean Shift + Canny.

Resultado:

Colunas lado a lado: Original → Segmentada (Mean Shift) → Bordas (Canny).

Útil para analisar se o pré-processamento melhora a detecção de bordas.

**Mean Shift + Canny – Grupo 2 (meanshift_canny_grupo2.html)**

Passos:

Selecione uma imagem do Grupo 2.

Ajuste apenas os thresholds low e high do Canny (Mean Shift usa hs=10, hr=20 fixos).

Clique em Aplicar Mean Shift + Canny.

Resultado:

Colunas lado a lado: Original → Segmentada (Mean Shift) → Bordas (Canny).

Permite analisar se os parâmetros do Grupo 1 transferem bem para novas imagens.

Observações gerais sobre os controles

**Sliders:**

hs: controla o raio espacial do Mean Shift (quanto maior, mais regiões homogêneas).

hr: controla a similaridade de cor do Mean Shift (quanto maior, mais cores serão agrupadas).

low e high: thresholds do Canny (detecção de bordas).

Botão de Aplicar: Sempre necessário após alterar parâmetros ou selecionar uma nova imagem.

Comparação visual: Cada aba mostra colunas para Original, Pré-processamento (quando aplicável) e Canny.

Dica: Teste primeiro em imagens menores ou regiões menores para encontrar os melhores parâmetros, depois aplique na imagem inteira.
