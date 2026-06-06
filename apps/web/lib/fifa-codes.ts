/** Maps FIFA 3-letter codes to ISO 3166-1 alpha-2 codes for flagcdn.com */
export const FIFA_TO_ISO2: Record<string, string> = {
  // Americas
  USA: 'us', CAN: 'ca', MEX: 'mx', BRA: 'br', ARG: 'ar', URU: 'uy',
  COL: 'co', CHI: 'cl', PER: 'pe', ECU: 'ec', PAR: 'py', BOL: 'bo',
  VEN: 've', CRC: 'cr', PAN: 'pa', HON: 'hn', GTM: 'gt', SLV: 'sv',
  JAM: 'jm', TRI: 'tt', HAI: 'ht', CUB: 'cu', DOM: 'do',
  // Europe
  FRA: 'fr', GER: 'de', ESP: 'es', ITA: 'it', POR: 'pt', NED: 'nl',
  BEL: 'be', POL: 'pl', SWI: 'ch', AUT: 'at', DEN: 'dk', SWE: 'se',
  NOR: 'no', FIN: 'fi', ISL: 'is', IRL: 'ie', WAL: 'gb-wls',
  SCO: 'gb-sct', ENG: 'gb-eng', NIR: 'gb-nir', CRO: 'hr', SRB: 'rs',
  SVK: 'sk', CZE: 'cz', HUN: 'hu', ROU: 'ro', BUL: 'bg', GRE: 'gr',
  ALB: 'al', MKD: 'mk', BIH: 'ba', MNE: 'me', SVN: 'si', UKR: 'ua',
  TUR: 'tr', GEO: 'ge', ARM: 'am', AZE: 'az',
  // Africa
  MAR: 'ma', EGY: 'eg', SEN: 'sn', GHA: 'gh', NGA: 'ng', CMR: 'cm',
  CIV: 'ci', TUN: 'tn', MLI: 'ml', RSA: 'za', ALG: 'dz', UGA: 'ug',
  KEN: 'ke', ETH: 'et', MOZ: 'mz', ANK: 'ao', ZIM: 'zw', ZAM: 'zm',
  COD: 'cd', COG: 'cg', GAB: 'ga', GNB: 'gw', GUI: 'gn', LBR: 'lr',
  SLE: 'sl', BUR: 'bf', BEN: 'bj', TOG: 'tg', CPV: 'cv',
  // Asia / Middle East / Oceania
  JPN: 'jp', KOR: 'kr', CHN: 'cn', AUS: 'au', IRN: 'ir', SAU: 'sa', KSA: 'sa', // KSA = alternate FIFA code for Saudi Arabia
  UAE: 'ae', QAT: 'qa', IRQ: 'iq', SYR: 'sy', JOR: 'jo', LEB: 'lb',
  KUW: 'kw', OMA: 'om', BHR: 'bh', ISR: 'il', IND: 'in', PAK: 'pk',
  BAN: 'bd', NZL: 'nz', PHI: 'ph', IDN: 'id', THA: 'th', VIE: 'vn',
  MAS: 'my', SGP: 'sg', UZB: 'uz', KAZ: 'kz', TKM: 'tm', KGZ: 'kg',
}

export function getFlagCode(fifaCode: string): string {
  return FIFA_TO_ISO2[fifaCode.toUpperCase()] ?? fifaCode.toLowerCase().slice(0, 2)
}
