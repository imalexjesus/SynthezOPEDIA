/**
 * Utility for economy-related calculations: inflation and currency conversion.
 */

const AVG_INFLATION_RATE = 0.0337; // ~3.37% annually for USD
const CURRENT_YEAR = 2026;
const UAH_EXCHANGE_RATE = 41.6; // NBU rate fixed for the build

/**
 * Calculates the inflation-adjusted value of a USD price from a given year.
 * @param releasePrice - The original price in USD
 * @param releaseYear - The year of release
 * @returns { adjustedUSD: number, convertedUAH: number }
 */
export function calculateInflation(releasePrice: number, releaseYear: number) {
  if (!releasePrice || !releaseYear) return { adjustedUSD: 0, convertedUAH: 0 };
  
  const yearsElapsed = CURRENT_YEAR - releaseYear;
  if (yearsElapsed < 0) return { adjustedUSD: releasePrice, convertedUAH: releasePrice * UAH_EXCHANGE_RATE };
  
  // Compound interest formula: P_now = P_then * (1 + r)^n
  const adjustedUSD = releasePrice * Math.pow(1 + AVG_INFLATION_RATE, yearsElapsed);
  const convertedUAH = adjustedUSD * UAH_EXCHANGE_RATE;
  
  return {
    adjustedUSD: Math.round(adjustedUSD),
    convertedUAH: Math.round(convertedUAH / 100) * 100 // Round to nearest 100 UAH
  };
}

/**
 * Formats a number as a currency string.
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats a number as UAH string.
 */
export function formatUAH(value: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0
  }).format(value);
}
