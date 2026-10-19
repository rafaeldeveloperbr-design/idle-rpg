/**
 * Formata números para exibição na UI, removendo casas decimais
 * @param value - Número a ser formatado
 * @returns String formatada sem decimais
 */
export const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString('pt-BR');
};

/**
 * Arredonda número para inteiro (usar em cálculos)
 * @param value - Número a ser arredondado
 * @returns Número inteiro
 */
export const roundNumber = (value: number): number => {
  return Math.round(value);
};

/**
 * Arredonda número para baixo (usar em HP/vida para não mostrar mais do que tem)
 * @param value - Número a ser arredondado
 * @returns Número inteiro arredondado para baixo
 */
export const floorNumber = (value: number): number => {
  return Math.floor(value);
};
