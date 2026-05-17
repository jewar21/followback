import { colombiaDepartments } from './colombia-locations'

type CountryOption = {
  name: string
  isoCode: string
}

export const PRIMARY_COUNTRY_NAME = 'Colombia'
export const countries: CountryOption[] = [{ name: PRIMARY_COUNTRY_NAME, isoCode: 'CO' }]

export function hasStructuredLocationsForCountry(countryName: string) {
  return countryName === PRIMARY_COUNTRY_NAME
}

export function getDepartmentsForCountry(countryName: string): string[] {
  if (!hasStructuredLocationsForCountry(countryName)) {
    return []
  }

  return colombiaDepartments.map((department) => department.department)
}

export function getCitiesForCountryAndDepartment(countryName: string, departmentName: string): string[] {
  if (!hasStructuredLocationsForCountry(countryName) || !departmentName) {
    return []
  }

  return colombiaDepartments.find((department) => department.department === departmentName)?.cities ?? []
}

export function getCitiesForCountry(countryName: string): string[] {
  if (!hasStructuredLocationsForCountry(countryName)) {
    return []
  }

  return []
}
