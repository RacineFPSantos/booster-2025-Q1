/**
 * Remove caracteres não numéricos de uma string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida um CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = removeNonNumeric(cpf);

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Valida o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Valida o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Valida um CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = removeNonNumeric(cnpj);

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Valida o primeiro dígito verificador
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Valida o segundo dígito verificador
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF (xxx.xxx.xxx-xx)
 */
export function formatCPF(value: string): string {
  const cleanValue = removeNonNumeric(value);

  if (cleanValue.length <= 3) {
    return cleanValue;
  }
  if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  }
  if (cleanValue.length <= 9) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  }
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
}

/**
 * Formata um CNPJ (xx.xxx.xxx/xxxx-xx)
 */
export function formatCNPJ(value: string): string {
  const cleanValue = removeNonNumeric(value);

  if (cleanValue.length <= 2) {
    return cleanValue;
  }
  if (cleanValue.length <= 5) {
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  }
  if (cleanValue.length <= 8) {
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  }
  if (cleanValue.length <= 12) {
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
  }
  return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
}

/**
 * Valida documento de acordo com o tipo (CPF ou CNPJ)
 */
export function validateDocument(document: string, type: 'PF' | 'PJ'): boolean {
  if (type === 'PF') {
    return isValidCPF(document);
  }
  return isValidCNPJ(document);
}

/**
 * Formata documento de acordo com o tipo (CPF ou CNPJ)
 */
export function formatDocument(document: string, type: 'PF' | 'PJ'): string {
  if (type === 'PF') {
    return formatCPF(document);
  }
  return formatCNPJ(document);
}
