
export const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

export const formatDate = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
};

export const isValidDate = (dateString: string) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateString)) return false;

  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();

  return date.getDate() === day &&
         date.getMonth() === month - 1 &&
         date.getFullYear() === year &&
         date <= now;
};

export const isValidCNPJ = (cnpj: string) => {
  const numbers = cnpj.replace(/\D/g, "");
  if (numbers.length !== 14) return false;

  // Validação do CNPJ (algoritmo)
  let sum = 0;
  let position = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * position;
    position = position === 2 ? 9 : position - 1;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(numbers[12])) return false;

  sum = 0;
  position = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * position;
    position = position === 2 ? 9 : position - 1;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(numbers[13]);
};

export const isValidPhone = (phone: string) => {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length >= 10 && numbers.length <= 11;
};
