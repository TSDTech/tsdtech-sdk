import { SplitRule, VALID_SPLIT_TYPES } from "./create-card-deposit-request.interface.js";

/**
 * Valida as regras de split de uma transação.
 * - A soma dos valores dos splits não pode exceder o valor total da transação.
 * - Verifica se os subaccountIds estão presentes.
 */
export function validateCardSplits(totalAmount: number, splits?: SplitRule[]): void {
  if (!splits || splits.length === 0) return;

  let splitSum = 0;

  for (const split of splits) {
    if (!split.subaccountId || split.subaccountId.trim() === '') {
      throw new Error('Validation Error: Todos os splits devem conter um subaccountId válido.');
    }

    if (split.amount < 0) {
      throw new Error('Validation Error: O valor do split não pode ser negativo.');
    }

    if (split.splitType && !(VALID_SPLIT_TYPES as readonly string[]).includes(split.splitType)) {
      throw new Error(`Validation Error: Tipo de split inválido ('${split.splitType}'). Os tipos suportados são: ${VALID_SPLIT_TYPES.join(', ')}.`);
    }

    splitSum += split.amount;
  }

  // Tratando precisão de ponto flutuante do JS
  const diff = Number((splitSum - totalAmount).toFixed(2));
  
  if (diff > 0) {
    throw new Error(`Validation Error: A soma dos splits (${splitSum}) excede o valor total da transação (${totalAmount}).`);
  }
}