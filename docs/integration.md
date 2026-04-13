# Documentação de integração – tsdtech-sdk

Esta pasta descreve como integrar a biblioteca **tsdtech-sdk** no seu backend para fluxos de checkout (PIX, Boleto) e gerenciamento de subcontas com integração ao **ms-subaccount**.

## Índice

- [Visão geral](#visão-geral)
- [Instalação](#instalação)
- [Inicialização](#inicialização)
- [API](#api)
- [Integração no backend (exemplo Nest)](#integração-no-backend-exemplo-nest)
- [Tratamento de erros](#tratamento-de-erros)

---

## Visão geral

A **tsdtech-sdk** é uma lib Node.js que:

- Expõe DTOs e a lógica de integração com o **ms-subaccount** (gerenciamento de subcontas e criação de intents de depósito).
- **Não** expõe endpoints HTTP; quem expõe rotas é o seu backend (ex.: spa-backend).
- É consumida como dependência: o backend instancia `TsdTechSdk()` e chama seus métodos para criar depósitos PIX, boletos ou gerenciar subcontas.

Fluxo resumido:

1. Backend instancia `TsdTechSdk` com credenciais (apiKey e orgId).
2. Backend cria ou lista subcontas via `createSubaccount()` ou `getSubaccounts()`.
3. Cliente inicia checkout com método PIX ou Boleto no backend.
4. Backend chama `createPixDepositRequest()` ou `createSlipDepositRequest()` com a subaccount e valor.
5. A lib envia POST para o ms-subaccount e retorna QR Code, código de barras, etc.
6. Backend mapeia a resposta para o DTO do seu contrato (ex.: `PixResponseDto`) e devolve ao cliente.

---

## Instalação

### Via npm (pacote publicado)

```bash
npm install tsdtech-sdk
```

### Via cópia local (desenvolvimento / testes)

No `package.json` do backend:

```json
{
  "dependencies": {
    "tsdtech-sdk": "file:../tsdtech-sdk"
  }
}
```

Requisitos:

- Os projetos estão no mesmo nível (ex.: `workspace/tsdtech-sdk` e `workspace/spa-backend`).
- Na pasta da lib, rode `npm run build` antes (e sempre que alterar o código):

```bash
cd /caminho/para/tsdtech-sdk
npm run build
```

Depois, no backend:

```bash
cd /caminho/para/spa-backend
npm install
```

### Via npm link (symlink para desenvolvimento)

```bash
cd tsdtech-sdk
npm run build
npm link

cd spa-backend
npm link tsdtech-sdk
```

Após isso, cada `npm run build` na lib já atualiza o que o backend enxerga.

---

## Inicialização

Importe e instancie a classe `TsdTechSdk` com suas credenciais:

```ts
import { TsdTechSdk } from "tsdtech-sdk";

const sdk = new TsdTechSdk({
  bankingApiKey: "your-api-key-here",
  bankingOrgId: "your-org-id-uuid",
});
```

**Parâmetros:**

| Parâmetro       | Tipo     | Obrigatório | Descrição                                        |
| --------------- | -------- | ----------- | ------------------------------------------------ |
| `bankingApiKey` | `string` | Sim         | Chave de API para autenticação com ms-subaccount |
| `bankingOrgId`  | `string` | Sim         | UUID da organização (header `org-id`)            |

Recomenda-se armazenar essas credenciais em variáveis de ambiente e carregá-las durante a inicialização do seu backend.

---

## API

Após instanciar `TsdTechSdk`, você tem acesso aos seguintes métodos:

### 1. `createPixDepositRequest(input, idempotencyKey)`

Cria uma solicitação de depósito via PIX para uma subaconta.

**Assinatura:**

```ts
public async createPixDepositRequest(
  input: CreatePixDepositRequestInput,
  idempotencyKey: string
): Promise<DepositRequestResponse>;
```

**Input: `CreatePixDepositRequestInput`**

| Campo          | Tipo     | Obrigatório | Descrição                                    |
| -------------- | -------- | ----------- | -------------------------------------------- |
| `subaccountId` | `string` | Sim         | UUID da subaconta onde o depósito será feito |
| `amount`       | `number` | Sim         | Valor em reais                               |

**Parâmetro `idempotencyKey`**

- Tipo: `string`
- Obrigatório: Sim
- Descrição: Identificador único (ex.: UUIDv4) para garantir idempotência e evitar duplicatas de transação.

**Resposta: `DepositRequestResponse`**

| Campo            | Tipo     | Descrição                                        |
| ---------------- | -------- | ------------------------------------------------ |
| `id`             | `string` | UUID único do depósito criado                    |
| `createdAtUtc`   | `string` | Data/hora de criação (ISO 8601 UTC)              |
| `updatedAtUtc`   | `string` | Data/hora da última atualização (ISO 8601 UTC)   |
| `subaccountId`   | `string` | UUID da subaconta                                |
| `amount`         | `number` | Valor do depósito                                |
| `paymentMethod`  | `string` | Método de pagamento (`PIX` ou `SLIP`)            |
| `status`         | `string` | Status do depósito (ex.: `PENDING`, `COMPLETED`) |
| `idempotencyKey` | `string` | Chave de idempotência usada na criação           |
| `textQrCode?`    | `string` | Código PIX para copiar e colar                   |
| `base64Path?`    | `string` | QR Code em formato Base64                        |

**Exemplo:**

```ts
const pixResult = await sdk.createPixDepositRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 150.75,
  },
  "f47ac10b-58cc-4372-a567-0e02b2c3d479", // UUIDv4
);

console.log("QR Code (texto):", pixResult.textQrCode);
console.log("QR Code (imagem):", pixResult.base64Path);
```

---

### 2. `createSlipDepositRequest(input, idempotencyKey)`

Cria uma solicitação de depósito via Boleto (Slip) para uma subaconta.

**Assinatura:**

```ts
public async createSlipDepositRequest(
  input: CreateSlipDepositRequestInput,
  idempotencyKey: string
): Promise<DepositRequestResponse>;
```

**Input: `CreateSlipDepositRequestInput`**

| Campo          | Tipo               | Obrigatório | Descrição                                                                   |
| -------------- | ------------------ | ----------- | --------------------------------------------------------------------------- |
| `subaccountId` | `string`           | Sim         | UUID da subaconta                                                           |
| `amount`       | `number`           | Sim         | Valor em reais                                                              |
| `dueDate`      | `string`           | Sim         | Data de vencimento (ISO 8601 **sem milissegundos**: `YYYY-MM-DDThh:mm:ssZ`) |
| `email?`       | `string`           | Não         | Email para enviar o boleto ao pagador                                       |
| `payer`        | `SlipDepositPayer` | Sim         | Dados do pagador (ver abaixo)                                               |

**`SlipDepositPayer`**

| Campo                    | Tipo     | Obrigatório | Descrição                           |
| ------------------------ | -------- | ----------- | ----------------------------------- |
| `name`                   | `string` | Sim         | Nome completo ou razão social       |
| `address`                | `string` | Sim         | Endereço completo                   |
| `neighborhood`           | `string` | Sim         | Bairro                              |
| `city`                   | `string` | Sim         | Cidade                              |
| `state`                  | `string` | Sim         | UF (ex.: `SP`, `RJ`)                |
| `zipCode`                | `string` | Sim         | CEP (apenas números)                |
| `taxId`                  | `number` | Sim         | CPF ou CNPJ (apenas números)        |
| `thirdPartyDdi?`         | `number` | Não         | Código país (ex.: `55` para Brasil) |
| `thirdPartyDdd?`         | `number` | Não         | DDD/código de área (ex.: `11`)      |
| `thirdPartyPhoneNumber?` | `number` | Não         | Número de telefone                  |

**Exemplo:**

```ts
import crypto from "crypto";

const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 3); // 3 dias a contar de hoje
const formattedDueDate = dueDate.toISOString().replace(/\.\d{3}Z$/, "Z"); // Remove milissegundos

const slipResult = await sdk.createSlipDepositRequest(
  {
    subaccountId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 300.0,
    dueDate: formattedDueDate,
    email: "customer@example.com",
    payer: {
      name: "João da Silva",
      taxId: 12345678909, // CPF
      address: "Rua das APIs, 123",
      neighborhood: "Bairro do Código",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001000",
      thirdPartyDdi: 55,
      thirdPartyDdd: 11,
      thirdPartyPhoneNumber: 987654321,
    },
  },
  crypto.randomUUID(),
);

console.log("Código de barras:", slipResult.digitableLine);
console.log("Boleto (PDF):", slipResult.base64Path);
```

---

### 3. `createSubaccount(input)`

Cria uma nova subaconta vinculada a um titular.

**Assinatura:**

```ts
public async createSubaccount(
  input: CreateSubaccountInput
): Promise<SubaccountResponse>;
```

**Input: `CreateSubaccountInput`**

| Campo                 | Tipo                   | Obrigatório | Descrição                                            |
| --------------------- | ---------------------- | ----------- | ---------------------------------------------------- |
| `holderId`            | `string`               | Sim         | UUID do titular                                      |
| `digitalAccountId`    | `string`               | Sim         | ID da conta digital a associar                       |
| `subaccountParentId?` | `string`               | Não         | UUID da subaconta pai (para estruturas hierárquicas) |
| `name?`               | `string`               | Não         | Nome identificador da subaconta                      |
| `status`              | `SubaccountStatusEnum` | Sim         | Status inicial (`ACTIVE`, `BLOCKED`, `INACTIVE`)     |

**Resposta: `SubaccountResponse`**

| Campo              | Tipo     | Descrição                       |
| ------------------ | -------- | ------------------------------- |
| `id`               | `string` | UUID da subaconta criada        |
| `holderId`         | `string` | UUID do titular                 |
| `digitalAccountId` | `string` | ID da conta digital associada   |
| `name`             | `string` | Nome da subaconta               |
| `status`           | `string` | Status atual                    |
| `createdAtUtc`     | `string` | Data/hora de criação (ISO 8601) |
| `updatedAtUtc`     | `string` | Data/hora da última atualização |

**Exemplo:**

```ts
import { SubaccountStatusEnum } from "tsdtech-sdk";

const subaccount = await sdk.createSubaccount({
  holderId: "00000000-0000-0000-0000-000000000001",
  digitalAccountId: "53562578-2ec1-4e9f-8d65-a87d3e19020d",
  name: "Subconta Vendas - Região SP",
  status: SubaccountStatusEnum.ACTIVE,
});

console.log("Subaconta criada:", subaccount.id);
```

---

### 4. `getSubaccounts(filters?, pagination?)`

Lista subcontas com filtros e paginação opcionais.

**Assinatura:**

```ts
public async getSubaccounts(
  filters?: FilterSubaccountInput,
  pagination?: PaginationInput
): Promise<PaginatedListResponse<SubaccountResponse>>;
```

**Input: `FilterSubaccountInput`** (opcional)

| Campo                | Tipo                     | Descrição                            |
| -------------------- | ------------------------ | ------------------------------------ |
| `ids?`               | `string[]`               | Filtrar por IDs de subcontas         |
| `holderIds?`         | `string[]`               | Filtrar por IDs de titulares         |
| `names?`             | `string[]`               | Filtrar por nomes (busca parcial)    |
| `statuses?`          | `SubaccountStatusEnum[]` | Filtrar por status                   |
| `nextSnapshotAtUtc?` | `string`                 | Filtrar por data de próximo snapshot |

**Input: `PaginationInput`** (opcional)

| Campo       | Tipo     | Descrição                      |
| ----------- | -------- | ------------------------------ |
| `page?`     | `number` | Número da página (começa em 1) |
| `pageSize?` | `number` | Itens por página               |

**Resposta: `PaginatedListResponse<SubaccountResponse>`**

| Campo        | Tipo                   | Descrição                                 |
| ------------ | ---------------------- | ----------------------------------------- |
| `items`      | `SubaccountResponse[]` | Array de subcontas da página atual        |
| `pageCount`  | `number`               | Número total de páginas                   |
| `totalItems` | `number`               | Número total de itens em todas as páginas |

**Exemplo:**

```ts
import { SubaccountStatusEnum } from "tsdtech-sdk";

// Listar todas as subcontas
const allSubaccounts = await sdk.getSubaccounts();

// Com filtros
const activeSubaccounts = await sdk.getSubaccounts({
  statuses: [SubaccountStatusEnum.ACTIVE],
});

// Com paginação
const page2 = await sdk.getSubaccounts({}, { page: 2, pageSize: 20 });

// Com filtros e paginação
const filtered = await sdk.getSubaccounts(
  {
    names: ["Vendas"],
    statuses: [SubaccountStatusEnum.ACTIVE],
  },
  { page: 1, pageSize: 10 },
);
```

---

## Integração no backend (exemplo Nest)

### Exemplo 1: Criar depósito PIX

```ts
import { TsdTechSdk } from "tsdtech-sdk";
import crypto from "crypto";

// No seu serviço de checkout (Nest)
export class CheckoutService {
  private sdk: TsdTechSdk;

  constructor() {
    this.sdk = new TsdTechSdk({
      bankingApiKey: process.env.BANKING_API_KEY,
      bankingOrgId: process.env.BANKING_ORG_ID,
    });
  }

  async initiatePixCheckout(
    orderId: string,
    customerId: string,
    amount: number,
  ) {
    try {
      // Assumindo que você já tem a subaccount vinculada ao cliente
      const subaccountId = await this.getSubaccountForCustomer(customerId);

      const pixResult = await this.sdk.createPixDepositRequest(
        {
          subaccountId,
          amount,
        },
        crypto.randomUUID(), // Idempotency key
      );

      // Mapear para seu DTO
      return {
        qrCode: pixResult.base64Path,
        copyPasteCode: pixResult.textQrCode,
        depositId: pixResult.id,
        status: pixResult.status,
      };
    } catch (err) {
      console.error("Erro ao criar depósito PIX:", err);
      throw err;
    }
  }

  private async getSubaccountForCustomer(customerId: string): Promise<string> {
    // Lógica para obter ou criar subaccount do cliente
    // ...
    return "subaccount-id";
  }
}
```

### Exemplo 2: Criar depósito Boleto (Slip)

```ts
async initiateSlipCheckout(
  orderId: string,
  customerId: string,
  amount: number,
  payerData: SlipDepositPayer
) {
  try {
    const subaccountId = await this.getSubaccountForCustomer(customerId);

    // Calcular data de vencimento válida (sem milissegundos)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const formattedDueDate = dueDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

    const slipResult = await this.sdk.createSlipDepositRequest(
      {
        subaccountId,
        amount,
        dueDate: formattedDueDate,
        email: payerData.email,
        payer: {
          name: payerData.name,
          taxId: payerData.taxId,
          address: payerData.address,
          neighborhood: payerData.neighborhood,
          city: payerData.city,
          state: payerData.state,
          zipCode: payerData.zipCode,
        },
      },
      crypto.randomUUID()
    );

    return {
      barcode: slipResult.digitableLine,
      boletoUrl: slipResult.base64Path,
      depositId: slipResult.id,
      dueDate: formattedDueDate,
      status: slipResult.status,
    };
  } catch (err) {
    console.error("Erro ao criar depósito Boleto:", err);
    throw err;
  }
}
```

### Exemplo 3: Criar e listar subcontas

```ts
async createSubaccountForCustomer(customerId: string, holderId: string) {
  try {
    const subaccount = await this.sdk.createSubaccount({
      holderId,
      digitalAccountId: process.env.DIGITAL_ACCOUNT_ID,
      name: `Subconta - Cliente ${customerId}`,
      status: SubaccountStatusEnum.ACTIVE,
    });

    // Armazenar mapeamento customerId -> subaccountId no seu banco de dados
    await this.saveSubaccountMapping(customerId, subaccount.id);

    return subaccount;
  } catch (err) {
    console.error("Erro ao criar subaccount:", err);
    throw err;
  }
}

async listActiveSubaccounts() {
  try {
    const result = await this.sdk.getSubaccounts(
      {
        statuses: [SubaccountStatusEnum.ACTIVE],
      },
      { page: 1, pageSize: 50 }
    );

    console.log(`Total de subcontas ativas: ${result.totalItems}`);
    return result.items;
  } catch (err) {
    console.error("Erro ao listar subcontas:", err);
    throw err;
  }
}
```

---

## Tratamento de erros

A lib lança erros do Axios quando a API ms-subaccount retorna falhas. Não há uma classe de erro customizada; trabalhe com erros nativos do HTTP.

### Estrutura de erro do Axios

Quando o ms-subaccount retorna um erro (4xx ou 5xx), você terá acesso a:

```ts
try {
  await sdk.createPixDepositRequest(input, idempotencyKey);
} catch (err: any) {
  if (err.response) {
    // Request foi feito, resposta recebida com status de erro
    console.error("HTTP Status:", err.response.status);
    console.error("Dados do erro:", err.response.data);
    // err.response.data pode conter: { error: { code, title, status, message, details } }
  } else if (err.request) {
    // Request foi feito, mas nenhuma resposta
    console.error("Sem resposta do servidor");
  } else {
    // Erro ao configurar o request
    console.error("Erro:", err.message);
  }
}
```

### Exemplo: Tratar erro de duplicata (idempotência)

```ts
try {
  const result = await sdk.createPixDepositRequest(
    { subaccountId, amount },
    idempotencyKey,
  );
} catch (err: any) {
  if (err.response?.status === 409) {
    console.log("Depósito já foi criado com essa chave de idempotência");
    // Recuperar o depósito existente
  } else {
    console.error("Erro ao criar depósito:", err.response?.data);
    throw err;
  }
}
```

### Exemplo: Validar entrada antes de chamar a API

```ts
if (!subaccountId || typeof amount !== "number" || amount <= 0) {
  throw new Error("Entrada inválida: subaccountId e amount obrigatórios");
}

try {
  const result = await sdk.createPixDepositRequest(
    { subaccountId, amount },
    idempotencyKey,
  );
} catch (err: any) {
  if (err.response) {
    // Erro da API
    const status = err.response.status;
    const errorData = err.response.data;

    if (status === 400) {
      console.error("Erro de validação da API:", errorData);
    } else if (status === 404) {
      console.error("Subaccount não encontrada");
    } else if (status >= 500) {
      console.error("Erro do servidor ms-subaccount");
    }
  }
  throw err;
}
```

---

## Referência rápida de exports

```ts
// Classe principal
import { TsdTechSdk } from "tsdtech-sdk";

// Tipos e interfaces
import type {
  CreatePixDepositRequestInput,
  DepositRequestResponse,
  CreateSlipDepositRequestInput,
  SlipDepositPayer,
  CreateSubaccountInput,
  SubaccountResponse,
  FilterSubaccountInput,
  PaginationInput,
  PaginatedListResponse,
} from "tsdtech-sdk";

// Enums
import {
  SubaccountStatusEnum,
  PaymentMethod,
  DepositRequestStatus,
} from "tsdtech-sdk";

// Uso completo
const sdk = new TsdTechSdk({
  bankingApiKey: "...",
  bankingOrgId: "...",
});

const pixDeposit = await sdk.createPixDepositRequest(
  {
    subaccountId: "...",
    amount: 100,
  },
  crypto.randomUUID(),
);

const slipDeposit = await sdk.createSlipDepositRequest(
  {
    subaccountId: "...",
    amount: 100,
    dueDate: "2025-04-20T00:00:00Z",
    payer: {
      name: "...",
      taxId: 12345678900,
      address: "...",
      neighborhood: "...",
      city: "...",
      state: "SP",
      zipCode: "01001000",
    },
  },
  crypto.randomUUID(),
);

const subaccount = await sdk.createSubaccount({
  holderId: "...",
  digitalAccountId: "...",
  status: SubaccountStatusEnum.ACTIVE,
});

const subaccounts = await sdk.getSubaccounts(
  { statuses: [SubaccountStatusEnum.ACTIVE] },
  { page: 1, pageSize: 10 },
);
```
