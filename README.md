# spa-checkout

Biblioteca Node.js para SPA Checkout.

## Requisitos

- Node.js >= 18

## Instalação

```bash
npm install
```

## Build

```bash
npm run build
```

Gera os arquivos em `dist/` (JavaScript + declarações TypeScript).

## Uso

Após o build, em outro projeto:

```ts
import { greet } from 'spa-checkout';

console.log(greet('World')); // "Hello, World!"
```

## Estrutura

```
spa-checkout/
├── src/
│   ├── index.ts    # ponto de entrada, re-exporta a API pública
│   └── example.ts  # exemplo; substitua pelos seus módulos
├── dist/           # gerado pelo build (não versionar)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run clean` | Remove `dist/` |
| `npm run prepublishOnly` | Roda antes de publicar no npm |
