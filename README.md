# tsdtech-sdk

Biblioteca Node.js para Tsdtech Checkout (PIX, Boleto) e gerenciamento de subcontas com integração ao **ms-subaccount**.

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

## Uso (Quick Start)

Instancie `TsdTechSdk` com suas credenciais e comece a usar:

```ts
import {
  TsdTechSdk,
  SubaccountStatusEnum,
  WithdrawalRequestStatusEnum,
  PinBankPaymentAccountTypeEnum,
} from "tsdtech-sdk";
import crypto from "crypto";

// Inicializar
const sdk = new TsdTechSdk({
  bankingApiKey: process.env.BANKING_API_KEY,
  bankingOrgId: process.env.BANKING_ORG_ID,
  environment: 'hml',
});

// Criar depósito PIX
const pixDeposit = await sdk.createPixDepositRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 100.0,
  },
  crypto.randomUUID(),
);
console.log("QR Code:", pixDeposit.textQrCode);
console.log("Base64:", pixDeposit.base64Path);

// Criar depósito Boleto
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 3);
const formattedDueDate = dueDate.toISOString().replace(/\.\d{3}Z$/, "Z");

const slipDeposit = await sdk.createSlipDepositRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 150.0,
    dueDate: formattedDueDate,
    payer: {
      name: "João da Silva",
      taxId: 12345678909,
      address: "Rua das APIs, 123",
      neighborhood: "Bairro do Código",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001000",
    },
  },
  crypto.randomUUID(),
);
console.log("Código de barras:", slipDeposit.digitableLine);

// Criar subaccount
const subaccount = await sdk.createSubaccount({
  holderId: "uuid-do-titular",
  digitalAccountId: "uuid-da-conta-digital",
  name: "Minha Subconta",
  status: SubaccountStatusEnum.ACTIVE,
});
console.log("Subaccount ID:", subaccount.id);

// Listar subcontas
const subaccounts = await sdk.getSubaccounts(
  { statuses: [SubaccountStatusEnum.ACTIVE] },
  { page: 1, pageSize: 10 },
);
console.log(`Total: ${subaccounts.totalItems}`);

// Criar saque interno (transferência entre subcontas)
const internalWithdrawal = await sdk.createWithdrawalRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 200.0,
    destinationSubaccountId: "660e8400-e29b-41d4-a716-446655440001",
  },
  crypto.randomUUID(),
);
console.log("Saque interno:", internalWithdrawal.id, internalWithdrawal.status);

// Criar saque PIX externo
const pixWithdrawal = await sdk.createWithdrawalRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 150.0,
    pixKey: "destinatario@example.com",
  },
  crypto.randomUUID(),
);
console.log("Saque PIX:", pixWithdrawal.id);

// Criar saque TED externo
const tedWithdrawal = await sdk.createWithdrawalRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 500.0,
    beneficiary: {
      bankNumber: "001",
      bankBranch: "0001",
      accountNumber: "123456-7",
      name: "Maria Souza",
      document: "98765432100",
      accountType: PinBankPaymentAccountTypeEnum.CACC,
    },
  },
  crypto.randomUUID(),
);
console.log("Saque TED:", tedWithdrawal.id);

// Listar saques pendentes
const withdrawals = await sdk.getWithdrawalRequests(
  { statuses: [WithdrawalRequestStatusEnum.PENDING] },
  { page: 1, pageSize: 10 },
);
console.log(`Saques pendentes: ${withdrawals.totalItems}`);
```

Para mais detalhes, consulte a [Documentação de integração](docs/integration.md).

## Métodos disponíveis

| Método                          | Descrição                                         |
| ------------------------------- | ------------------------------------------------- |
| `createPixDepositRequest()`     | Cria uma solicitação de depósito via PIX           |
| `createSlipDepositRequest()`    | Cria uma solicitação de depósito via Boleto        |
| `createSubaccount()`            | Cria uma nova subaconta                           |
| `getSubaccounts()`              | Lista subcontas com filtros e paginação           |
| `createWithdrawalRequest()`     | Cria um saque (interno, PIX ou TED)               |
| `getWithdrawalRequests()`       | Lista saques com filtros e paginação              |

## Estrutura

```
tsdtech-sdk/
├── src/
│   ├── index.ts                    # Exports principais
│   ├── client/
│   │   ├── base-sdk.client.ts      # Cliente base com configuração HTTP
│   │   └── sdk.client.ts           # Implementação dos métodos
│   ├── dto/
│   │   ├── common/
│   │   │   └── pagination.interface.ts
│   │   ├── deposit-request/
│   │   │   ├── pix/
│   │   │   │   ├── create-pix-deposit-request.interface.ts
│   │   │   │   ├── deposit-request-response.interface.ts
│   │   │   │   ├── payment-method.enum.ts
│   │   │   │   └── status.enum.ts
│   │   │   └── slip/
│   │   │       ├── create-slip-deposit-request.interface.ts
│   │   │       └── slip-deposit-payer.interface.ts
│   │   ├── subaccount/
│   │   │   ├── subaccount-status.enum.ts
│   │   │   ├── create/
│   │   │   │   ├── create-subaccount.interface.ts
│   │   │   │   └── create-subaccount-response.interface.ts
│   │   │   └── filter/
│   │   │       └── filter-subaccounts.interface.ts
│   │   └── withdrawal-request/
│   │       ├── create-withdrawal-request-input.interface.ts
│   │       ├── withdrawal-request-response.interface.ts
│   │       ├── filter-withdrawal-request-input.interface.ts
│   │       ├── beneficiary-data.interface.ts
│   │       ├── withdrawal-request-status.enum.ts
│   │       ├── pinbank-payment-account-type.enum.ts
│   │       └── index.ts
│   └── test.ts                     # Exemplos de teste
├── dist/                           # Gerado pelo build (não versionar)
├── docs/
│   ├── README.md
│   └── integration.md              # Documentação detalhada
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script                   | Descrição                     |
| ------------------------ | ----------------------------- |
| `npm run build`          | Compila TypeScript → `dist/`  |
| `npm run build:watch`    | Compila e recompila ao salvar |
| `npm run clean`          | Remove `dist/`                |
| `npm run prepublishOnly` | Roda antes de publicar no npm |

## Documentação

- [Documentação de integração](docs/integration.md) – Guia completo com exemplos de uso e tratamento de erros.
