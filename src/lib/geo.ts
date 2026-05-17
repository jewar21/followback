import { City, Country } from 'country-state-city'

const SPANISH_NAMES: Record<string, string> = {
  Mexico: 'México',
  Brazil: 'Brasil',
  Panama: 'Panamá',
  Peru: 'Perú',
  'Dominican Republic': 'República Dominicana',
  Spain: 'España',
  'United States': 'Estados Unidos',
  Canada: 'Canadá',
}

// Countries shown at the top of the list (LatAm + Iberian Peninsula + NA)
const PRIORITY_CODES = new Set([
  'AR', 'BO', 'BR', 'CA', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC',
  'ES', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PT', 'PY',
  'SV', 'US', 'UY', 'VE',
])

function localName(name: string): string {
  return SPANISH_NAMES[name] ?? name
}

const allCountries = Country.getAllCountries().map((c) => ({
  name: localName(c.name),
  isoCode: c.isoCode,
}))

const priorityCountries = allCountries
  .filter((c) => PRIORITY_CODES.has(c.isoCode))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

const otherCountries = allCountries
  .filter((c) => !PRIORITY_CODES.has(c.isoCode))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

export const countries = [...priorityCountries, ...otherCountries]

const isoByName = new Map(countries.map((c) => [c.name, c.isoCode]))

export function getCitiesForCountry(countryName: string): string[] {
  const isoCode = isoByName.get(countryName)
  if (!isoCode) return []
  return City.getCitiesOfCountry(isoCode)?.map((c) => c.name) ?? []
}
