import crypto from 'crypto';
import { TsdTechSdk } from './index.js';
import { SubaccountStatusEnum } from './dto/subaccount/subaccount-status.enum.js';

async function testSdk() {
  const sdk = new TsdTechSdk({
    bankingApiKey: '8ce61d1f899ad9133c103244aaa3770afc262a3a662ef360165b41692a4ad1c2',
    bankingOrgId: '82097f08-f3f8-439e-88bb-cfc3d322ba38',
  });

  let testSubaccountId = 'b55bad6a-be43-456a-8fe3-a3cde9a8b961'; 
  const testHolderId = '30f9f04e-7070-48fd-a419-97a1c593b1b0'; // Substitua por um holderId válido do banco se quiser que a criação funcione

  console.log('=========================================');
  console.log('🚀 INICIANDO TESTES DO SDK TSD TECH 🚀');
  console.log('=========================================\n');

  // ==========================================
  // 1. TESTE: CRIAR SUBCONTA
  // ==========================================
  try {
    console.log('1️⃣ Iniciando: CREATE SUBACCOUNT...');
    const subaccountResponse = await sdk.createSubaccount({
      holderId: testHolderId,
      digitalAccountId: '53562578-2ec1-4e9f-8d65-a87d3e19020d', 
      name: 'Subconta de Teste Automatizado SDK',
      status: SubaccountStatusEnum.ACTIVE
    });
    
    console.log('✅ CREATE SUBACCOUNT - Sucesso!');
    console.dir(subaccountResponse, { depth: null });
    
    // Se criou com sucesso, usa esse novo ID para os testes de depósito abaixo
    testSubaccountId = subaccountResponse.id; 
  } catch (error: any) {
    console.error('❌ CREATE SUBACCOUNT - Falhou:');
    logError(error);
    console.log(`⚠️ Prosseguindo para o próximo teste usando a subconta de fallback (${testSubaccountId})...\n`);
  }

  console.log('\n-----------------------------------------\n');

  // ==========================================
  // 2. TESTE: LISTAR SUBCONTAS
  // ==========================================
  try {
    console.log('2️⃣ Iniciando: GET SUBACCOUNTS (Lista paginada)...');
    const getSubaccountsResponse = await sdk.getSubaccounts();
    
    console.log('✅ GET SUBACCOUNTS - Sucesso!');
    console.dir(getSubaccountsResponse, { depth: null });
  } catch (error: any) {
    console.error('❌ GET SUBACCOUNTS - Falhou:');
    logError(error);
  }

  console.log('\n-----------------------------------------\n');

  // ==========================================
  // 3. TESTE: CRIAR DEPÓSITO PIX
  // ==========================================
  try {
    console.log('3️⃣ Iniciando: CREATE PIX DEPOSIT...');
    const pixResponse = await sdk.createPixDepositRequest(
      {
        subaccountId: testSubaccountId,
        amount: 150.75,
      },
      crypto.randomUUID()
    );
    
    console.log('✅ CREATE PIX DEPOSIT - Sucesso!');
    console.dir(pixResponse, { depth: null });
  } catch (error: any) {
    console.error('❌ CREATE PIX DEPOSIT - Falhou:');
    logError(error);
  }

  console.log('\n-----------------------------------------\n');

  // ==========================================
  // 4. TESTE: CRIAR DEPÓSITO BOLETO (SLIP)
  // ==========================================
  try {
    console.log('4️⃣ Iniciando: CREATE SLIP DEPOSIT...');
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Define o vencimento para daqui a 3 dias

    const formattedDueDate = dueDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

    const slipResponse = await sdk.createSlipDepositRequest(
      {
        subaccountId: testSubaccountId,
        amount: 300.00,
        dueDate: formattedDueDate,
        email: 'dev@tsdtech.com',
        payer: {
          name: 'João da Silva SDK',
          taxId: 12345678909, // CPF/CNPJ
          address: 'Rua das APIs, 123',
          neighborhood: 'Bairro do Código',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01001000',
          thirdPartyDdi: 55,
          thirdPartyDdd: 11,
          thirdPartyPhoneNumber: 987654321
        }
      },
      crypto.randomUUID()
    );
    
    console.log('✅ CREATE SLIP DEPOSIT - Sucesso!');
    console.dir(slipResponse, { depth: null });
  } catch (error: any) {
    console.error('❌ CREATE SLIP DEPOSIT - Falhou:');
    logError(error);
  }

  console.log('\n=========================================');
  console.log('🏁 TESTES FINALIZADOS 🏁');
  console.log('=========================================');
}

// Função auxiliar para padronizar a exibição de erros do Axios
function logError(error: any) {
  if (error.response) {
    console.error(`Status HTTP: ${error.response.status}`);
    console.dir(error.response.data, { depth: null });
  } else {
    console.error(error.message);
  }
}

testSdk();

