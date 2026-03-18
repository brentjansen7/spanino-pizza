/**
 * Vervangt {{variabelen}} in een template met echte waarden.
 * @param {string} tekst - De template tekst
 * @param {Object} variabelen - Key-value paar van variabelen
 * @returns {string} - Tekst met ingevulde variabelen
 */
export function vervangVariabelen(tekst, variabelen) {
  if (!tekst) return '';
  return tekst.replace(/\{\{(\w+)\}\}/g, (match, sleutel) => {
    return variabelen[sleutel] !== undefined ? variabelen[sleutel] : match;
  });
}

/**
 * Formatteert een bedrag als Nederlandse valuta
 */
export function formateerBedrag(bedrag) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(bedrag);
}

/**
 * Formatteert een datum als Nederlandse datum
 */
export function formateerDatum(datum) {
  if (!datum) return '';
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(datum));
}
