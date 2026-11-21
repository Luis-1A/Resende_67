# Anderson — Uma Noite Especial (Arquitetura Híbrida Canvas + Modular)

Projeto organizado em módulos independentes com sistema visual híbrido: motor cinematográfico em Canvas em camadas + interface HTML/CSS narrativa.

## Estrutura

- `index.html`: Ponto de entrada semântico e palco visual (`.visual-stage`).
- `css/`: Estilos base (`variables.css`, `global.css`, `typography.css`, `layout.css`, `responsive.css`), camadas do palco visual (`visual-base.css`, `visual-layers.css`, `visual-lighting.css`, `visual-transitions.css`) e estilos por animação em `css/animations/`.
- `js/config/`:
  - `settings.js`: Preferências globais (`debug`, `audioEnabled`, `persistProgress`, tempos).
  - `visual-settings.js`: Camadas de profundidade, perfis adaptativos (`high`, `medium`, `eco`, `reduced`) e tamanho máximo de pool.
  - `effects-settings.js`: Ativação e parâmetros individuais de cada efeito visual.
  - `animations.config.js`: Controle central (`enabled`, arquivo JS/CSS, parâmetros) para módulos de cena.
  - `scenes.config.js`: Ordem das 9 cenas, textos/cartas e cores de transição.
- `js/visual-engine/`: Núcleo cinematográfico (`canvas-engine.js`, `canvas-manager.js`, `scene-renderer.js`, `atmosphere-system.js`, `lighting-system.js`, `particle-system.js`, `physics-system.js`, `transition-system.js`, `performance-manager.js`).
- `js/visual-effects/`: 11 efeitos visuais independentes (`stars`, `shooting-stars`, `light-rays`, `fireflies`, `glowing-particles`, `floating-lanterns`, `butterflies`, `petals`, `magical-dust`, `confetti`, `fireworks`).
- `js/visual-scenes/`: Controladores atmosféricos de cena (`opening-visual`, `birthday-visual`, `friendship-visual`, `letter-visual`, `finale-visual`).
- `js/animations/` & `js/scenes/`: Módulos narrativos/interativos e as 9 cenas (`scene-01-opening.js` a `scene-09-secret.js`), integrados ao `screen-manager.js` (Wake Lock) e `scene-manager.js`.

## Depuração

Adicione `?debug=1` à URL e chame `window.__ANDERSON_DEBUG__()` no console do navegador para inspecionar módulos carregados, ativos, encerrados e eventuais erros isolados.

