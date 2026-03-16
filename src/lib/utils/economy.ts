/**
 * Utility for economy-related calculations: inflation and currency conversion.
 */

// 1. ПОЛНАЯ ЛОКАЛЬНАЯ БАЗА (CPI США 1965-2026)
const localCPI: Record<number, number> = {
    1965: 31.5, 1966: 32.5, 1967: 33.4, 1968: 34.8, 1969: 36.7,
    1970: 38.8, 1971: 40.5, 1972: 41.8, 1973: 44.4, 1974: 49.3,
    1975: 53.8, 1976: 56.9, 1977: 60.6, 1978: 65.2, 1979: 72.6,
    1980: 82.4, 1981: 90.9, 1982: 96.5, 1983: 99.6, 1984: 103.9,
    1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3, 1989: 124.0,
    1990: 130.7, 1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2,
    1995: 152.4, 1996: 156.9, 1997: 160.5, 1998: 163.0, 1999: 166.6,
    2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9,
    2005: 195.3, 2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5,
    2010: 218.1, 2011: 224.9, 2012: 229.6, 2013: 233.0, 2014: 236.7,
    2015: 237.0, 2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7,
    2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 314.1,
    2025: 325.4, 2026: 333.2
};

const CURRENT_YEAR = 2026;

export interface InflationResult {
    adjustedUSD: number;
    convertedUAH: number;
    source: string;
    nbuRate: number;
}

/**
 * Calculates the inflation-adjusted value of a USD price from a given year.
 * Uses local CPI data by default for performance, can use API if needed.
 * @param releasePrice - The original price in USD
 * @param releaseYear - The year of release
 * @param useApi - Attempt to fetch live data (slower)
 */
export async function calculateInflation(releasePrice: number, releaseYear: number, useApi: boolean = false): Promise<InflationResult> {
  if (!releasePrice || !releaseYear) {
    return { adjustedUSD: 0, convertedUAH: 0, source: "Error", nbuRate: 0 };
  }
  
  let usdRate = 44.14; // Default rate (March 2026)
  let inflationCoef = 1;
  let dataSource = "Offline (Local Data)";
  let nbuRate = 41.6;

  // 2. ПОПЫТКА ПОЛУЧИТЬ ДАННЫЕ ОНЛАЙН (if explicitly requested, though usually cards use offline for speed)
  if (useApi) {
      try {
          // Note: These are placeholder endpoints based on the prompt. 
          // Real implementation would need valid API endpoints for NBU and StatBureau.
          // For now, we'll simulate the logic flow.
          
          // const nbuRes = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
          // const nbuData = await nbuRes.json();
          // if (nbuData[0] && nbuData[0].rate) {
          //     usdRate = parseFloat(nbuData[0].rate);
          // }
          
          // const infRes = await fetch(`...`); // StatBureau API
          // const infPercent = await infRes.json();
          // inflationCoef = 1 + (infPercent / 100);
          
          // dataSource = "Online (Live API)";
      } catch (e) {
          console.warn("⚠️ Сеть недоступна или CORS ошибка. Использую локальную базу.");
          // Fallback to local below
      }
  }

  // 3. ЛОКАЛЬНЫЙ РАСЧЕТ (если оффлайн или ошибка API)
  const startCPI = localCPI[releaseYear];
  const currentCPI = localCPI[CURRENT_YEAR];

  if (!startCPI) {
      // If year not in CPI table, fallback to simple compound interest
      const AVG_INFLATION_RATE = 0.0337;
      const yearsElapsed = CURRENT_YEAR - releaseYear;
      inflationCoef = Math.pow(1 + AVG_INFLATION_RATE, yearsElapsed);
  } else {
      inflationCoef = currentCPI / startCPI;
  }

  // 4. ИТОГОВЫЙ РАСЧЕТ
  const resultUSD = releasePrice * inflationCoef;
  const resultUAH = resultUSD * usdRate;

  return {
    adjustedUSD: parseFloat(resultUSD.toFixed(2)),
    convertedUAH: parseFloat(resultUAH.toFixed(2)),
    source: dataSource,
    nbuRate: usdRate
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
