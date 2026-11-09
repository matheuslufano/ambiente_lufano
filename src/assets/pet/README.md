# Assets oficiais do pet

A arte atual é um substituto vetorial interativo em `PetCharacter.tsx` e `PetScene.tsx`, não os PNGs oficiais da referência. Personagem, fundo, acessórios e objetos são camadas independentes. A lontrinha vetorial tem duas patas dianteiras, duas traseiras, duas orelhas e uma cauda.

Para usar os arquivos oficiais, adicione PNGs transparentes nesta pasta: `idle.png`, `reading.png`, `coffee.png`, `playing.png`, `sleeping.png`, `happy.png`, `hungry.png`, `celebrating.png`. `feeding.png` e `affection.png` também são aceitos. Sem uma pose específica, o manifesto usa idle.png; sem PNG algum, mantém o vetor, sem requisições 404.

Use a mesma prancheta/proporção e âncoras corporais em todas as poses. Não coloque cenário nem controles dentro do PNG do personagem. O manifesto detecta os arquivos no build. Ajuste as posições das camadas em PetGame.module.css ao integrar a arte oficial, sem redesenhar a identidade do personagem.
