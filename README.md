# spa-checkout

Biblioteca Node.js para SPA Checkout (integração PIX com ms-banking / Pinbank).

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

Gera os arquivos em `dist/` (JavaScript + declarações TypeScript). Sempre rode o build antes de publicar ou de usar a lib em outro projeto.

Para desenvolvimento com rebuild automático ao salvar:

```bash
npm run build:watch
```

## Uso local no spa-backend (testar sem publicar)

Com os dois projetos no mesmo nível (ex.: `workspace/spa-checkout` e `workspace/spa-backend`):

1. **Buildar a lib** (obrigatório; o backend usa o que está em `dist/`):

   ```bash
   cd /caminho/para/spa-checkout
   npm run build
   ```

2. **Instalar no backend** – no `spa-backend` já está configurado `"spa-checkout": "file:../spa-checkout"`. Rode no backend:

   ```bash
   cd /caminho/para/spa-backend
   npm install
   ```

   O npm vai linkar/copiar a pasta local para `node_modules/spa-checkout`. Sempre que alterar o código da lib, rode de novo `npm run build` na pasta da lib (ou use `npm run build:watch` num terminal e deixe rodando).

**Alternativa com `npm link`** (symlink global; ver o pacote atualizado sem reinstalar):

```bash
# Na pasta da lib (uma vez)
cd spa-checkout
npm run build
npm link

# No backend (uma vez)
cd spa-backend
npm link spa-checkout
```

Depois disso, qualquer `npm run build` em `spa-checkout` já deixa o backend usando a versão nova.

## Uso (API PIX)

Variáveis de ambiente (no app que consome a lib): `MS_BANKING_BASE_URL`, `MS_BANKING_API_KEY`, `MS_BANKING_ORG_ID`, `MS_BANKING_BANK_CODE`, `MS_BANKING_DIGITAL_ACCOUNT_PINBANK_ID`.

```ts
import {
  createPixDepositIntent,
  PixDepositIntentError,
} from 'spa-checkout';

// Criar intenção PIX (externalId = ex.: ID do pedido)
const res = await createPixDepositIntent({
  cpfCnpj: '12345678900',
  value: 130,
  externalId: orderId,
});
// res.base64Path, res.qrCodeText, etc.

// Em caso de erro (4xx/5xx do ms-banking)
catch (err) {
  if (err instanceof PixDepositIntentError) {
    // err.code, err.title, err.status, err.message, err.details
  }
}
```

## Estrutura

```
spa-checkout/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── errors.ts
│   ├── pix-deposit-intent.types.ts
│   └── ms-banking-client.ts
├── dist/           # gerado pelo build (não versionar)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run build:watch` | Compila e recompila ao salvar |
| `npm run clean` | Remove `dist/` |
| `npm run prepublishOnly` | Roda antes de publicar no npm |
