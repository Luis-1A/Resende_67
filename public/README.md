# Anderson — Uma Noite Especial (Arquitetura Modular)

Projeto organizado em módulos independentes de configuração, gerenciamento, cenas e animações.

## Estrutura

- `index.html`: Ponto de entrada semântico.
- `css/`: Estilos base (`variables.css`, `global.css`, `typography.css`, `layout.css`, `responsive.css`) e estilos específicos por animação em `css/animations/`.
- `js/config/`:
  - `settings.js`: Preferências globais (`debug`, `audioEnabled`, `persistProgress`, tempos).
  - `animations.config.js`: Controle central (`enabled`, arquivo JS/CSS, parâmetros) para ativar ou desativar animações sem apagar código.
  - `scenes.config.js`: Ordem das 9 cenas, textos/cartas e cores de transição.
- `js/main.js`, `js/scene-manager.js`, `js/animation-manager.js`, `js/screen-manager.js`, `js/audio-manager.js`: Orquestração, ciclo de vida (`init`, `play`, `stop`, `destroy`), carregamento sob demanda e Screen Wake Lock API.
- `js/animations/`: 15 módulos de animação independentes e reutilizáveis.
- `js/scenes/`: 9 definições de cena independentes (`scene-01-opening.js` a `scene-09-secret.js`).

## Depuração

Adicione `?debug=1` à URL e chame `window.__ANDERSON_DEBUG__()` no console do navegador para inspecionar módulos carregados, ativos, encerrados e eventuais erros isolados.
