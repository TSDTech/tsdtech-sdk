# Documentação de integração – spa-checkout

Esta pasta descreve como integrar a biblioteca **spa-checkout** no seu backend para fluxos de checkout, em especial o pagamento via PIX com o ms-banking (Pinbank).

## Índice

- [Visão geral](#visão-geral)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API](#api)
- [Integração no backend (exemplo Nest)](#integração-no-backend-exemplo-nest)
- [Tratamento de erros](#tratamento-de-erros)
- [Testes](#testes)

---

## Visão geral

A **spa-checkout** é uma lib Node.js que:

- Expõe DTOs e a lógica de integração com o **ms-banking** (endpoint de PIX deposit intents / Pinbank).
- **Não** expõe endpoints HTTP; quem expõe rotas é o seu backend (ex.: spa-backend).
- É consumida como dependência: o backend chama `createPixDepositIntent()` quando o método de pagamento for PIX e substitui o retorno mock pela resposta real do ms-banking.

Fluxo resumido:

1. Cliente inicia checkout com método PIX no backend.
2. Backend cria pedido/pagamento e chama `createPixDepositIntent({ cpfCnpj, value, externalId })`.
3. A lib envia POST para o ms-banking e retorna QR Code (texto e base64) ou lança erro tipado.
4. Backend mapeia a resposta para o DTO do seu contrato (ex.: `PixResponseDto`) e devolve ao cliente.

---

## Instalação

### Via npm (pacote publicado)

```bash
npm install spa-checkout
```

### Via cópia local (desenvolvimento / testes)

No `package.json` do backend:

```json
{
  "dependencies": {
    "spa-checkout": "file:../spa-checkout"
  }
}
```

Requisitos:

- Os projetos estão no mesmo nível (ex.: `workspace/spa-checkout` e `workspace/spa-backend`).
- Na pasta da lib, rode `npm run build` antes (e sempre que alterar o código):

```bash
cd /caminho/para/spa-checkout
npm run build
```

Depois, no backend:

```bash
cd /caminho/para/spa-backend
npm install
```

### Via npm link (symlink para desenvolvimento)

```bash
cd spa-checkout
npm run build
npm link

cd spa-backend
npm link spa-checkout
```

Após isso, cada `npm run build` na lib já atualiza o que o backend enxerga.

---

## Variáveis de ambiente

A lib lê a configuração do ms-banking de `process.env`. Configure no ambiente do seu backend:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MS_BANKING_BASE_URL` | URL base do ms-banking | `https://dev-back-ms-banking-....run.app` |
| `MS_BANKING_API_KEY` | Chave de API (header `x-api-key`) | — |
| `MS_BANKING_ORG_ID` | ID da organização (header `org-id`) | UUID |
| `MS_BANKING_BANK_CODE` | Código do banco (body `bankCode`) | `"101"` |
| `MS_BANKING_DIGITAL_ACCOUNT_PINBANK_ID` | ID da conta digital Pinbank (body) | UUID |

O **originId** não vem de env: é o **externalId** obrigatório informado em cada chamada (ex.: ID do pedido ou do pagamento).

---

## API

### Função principal: `createPixDepositIntent`

```ts
import { createPixDepositIntent } from 'spa-checkout';

const result = await createPixDepositIntent({
  cpfCnpj: '12345678900',   // CPF ou CNPJ do pagador
  value: 130,                // valor em reais
  externalId: orderId,       // ID externo (ex.: ID do pedido); enviado como originId ao ms-banking
});
```

**Assinatura:**

```ts
function createPixDepositIntent(
  input: CreatePixDepositIntentInput,
  configOverride?: Partial<MsBankingConfig>
): Promise<PixDepositIntentSuccessResponse>;
```

- **input**: `cpfCnpj`, `value`, `externalId` (todos obrigatórios).
- **configOverride**: opcional; usado em testes para não depender de env (ver [Testes](#testes)).
- **Retorno**: em sucesso, objeto com os campos do ms-banking (ver abaixo).
- **Erro**: em 4xx/5xx com body `error`, a lib lança `PixDepositIntentError` (ver [Tratamento de erros](#tratamento-de-erros)).

### Input: `CreatePixDepositIntentInput`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `cpfCnpj` | `string` | Sim | CPF ou CNPJ do pagador (apenas números ou formatado). |
| `value` | `number` | Sim | Valor em reais a cobrar. |
| `externalId` | `string` | Sim | Identificador externo (ex.: ID do pedido). Enviado ao ms-banking como `originId`. |

### Resposta de sucesso: `PixDepositIntentSuccessResponse`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `digitalAccountPinbankId` | `string` | ID da conta digital no Pinbank. |
| `urlCheckout` | `string` | URL do checkout (se aplicável). |
| `nsuTransfer` | `string` | NSU da transferência. |
| `pinbankQrCodeId` | `string` | ID do QR Code no Pinbank. |
| `qrCodeText` | `string` | Código PIX para copiar e colar. |
| `base64Path` | `string` | Imagem do QR Code em base64. |
| `endToEnd` | `string` | Identificador end-to-end. |
| `originalAmount` | `PixAmount?` | Valor original (objeto opcional). |
| `paidAmount` | `PixAmount?` | Valor pago (objeto opcional). |
| `paidAtUtc` | `string?` | Data/hora do pagamento (ISO 8601). |

Para preencher um DTO de checkout (ex.: `PixResponseDto` com `qrCode` e `copyPasteCode`), use por exemplo:

- `qrCode` ← `result.base64Path`
- `copyPasteCode` ← `result.qrCodeText`

---

## Integração no backend (exemplo Nest)

Exemplo de uso no serviço de checkout (Nest) quando o método de pagamento é PIX:

```ts
import { createPixDepositIntent, PixDepositIntentError } from 'spa-checkout';
import { HTTPError } from '@/core/base/error/http.error.entity';

// No método de checkout, após criar o pedido e calcular o valor final:
if (dto.paymentMethod === PaymentMethod.PIX) {
  try {
    const pixResult = await createPixDepositIntent({
      cpfCnpj: clientCpfCnpj,           // ex.: do cliente autenticado
      value: finalAmountToCharge,         // valor já com taxa PIX
      externalId: order.id,               // ID do pedido criado
    });

    resp.pix = {
      qrCode: pixResult.base64Path,
      copyPasteCode: pixResult.qrCodeText,
    };
  } catch (err) {
    if (err instanceof PixDepositIntentError) {
      throw HTTPError.getErrorFromCode({
        code: err.code,
        title: err.title,
        message: err.message,
        details: err.details,
      });
    }
    throw err;
  }
}
```

Garanta que as variáveis de ambiente do ms-banking estejam definidas no ambiente onde o backend roda (ou em `.env` carregado pelo Nest).

---

## Tratamento de erros

### Erro da API ms-banking: `PixDepositIntentError`

Quando o ms-banking retorna 4xx/5xx com body no formato `{ error: { code, title, status, message, details } }`, a lib lança `PixDepositIntentError`, que estende `Error` e expõe:

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `code` | `number` | Código HTTP ou do erro. |
| `title` | `string` | Título (ex.: `PIX_INTENT_CREATION_FAILED`). |
| `status` | `string` | Status lógico (ex.: `FAILED_PRECONDITION`). |
| `message` | `string` | Mensagem de erro. |
| `details` | `unknown` | Detalhes adicionais (ex.: stack, erro aninhado). |

Exemplo de body de erro do ms-banking:

```json
{
  "error": {
    "code": 400,
    "title": "PIX_INTENT_CREATION_FAILED",
    "status": "FAILED_PRECONDITION",
    "message": "Failed to create PIX payment intent",
    "details": { "message": "Cliente não possui chave Pix ativa para receber depósitos.", ... }
  }
}
```

No backend, capture `PixDepositIntentError` e converta para o seu formato de erro HTTP (ex.: `HTTPError.getErrorFromCode(...)`) antes de responder ao cliente.

### Outros erros

- Falhas de rede ou respostas sem o formato `error` esperado são repassadas pelo axios (não convertidas em `PixDepositIntentError`). Trate no backend como erro genérico de integração.

---

## Testes

Para testes unitários ou de integração sem depender de variáveis de ambiente, use o segundo parâmetro de `createPixDepositIntent`:

```ts
import { createPixDepositIntent } from 'spa-checkout';

const result = await createPixDepositIntent(
  {
    cpfCnpj: '12345678900',
    value: 100,
    externalId: 'test-order-123',
  },
  {
    baseUrl: 'https://ms-banking-mock.test',
    apiKey: 'test-key',
    orgId: 'test-org-id',
    bankCode: '101',
    digitalAccountPinbankId: 'test-account-id',
  }
);
```

Se o objeto de override tiver todos os campos obrigatórios de `MsBankingConfig`, a lib não tenta ler `process.env`.

---

## Referência rápida de exports

```ts
// Função e erro
import { createPixDepositIntent, PixDepositIntentError } from 'spa-checkout';

// Tipos
import type {
  CreatePixDepositIntentInput,
  PixDepositIntentSuccessResponse,
  PixAmount,
  MsBankingErrorPayload,
  MsBankingErrorResponse,
  MsBankingConfig,
} from 'spa-checkout';
```
