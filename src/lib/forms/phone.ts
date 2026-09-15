import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min'

/**
 * Phone numbers for the lead forms.
 *
 * A number is entered as a country plus the national number, checked against
 * that country's numbering plan with libphonenumber, and stored in E.164
 * (`+917012608089`) — one unambiguous form for whoever calls back. The same
 * checks run in the browser, to help while typing, and on the server, which is
 * the one that decides.
 */

export type PhoneCountry = {
  code: CountryCode
  name: string
  dial: string
  flag: string
}

/** Regional-indicator letters, so `IN` becomes 🇮🇳 where the platform draws flags. */
function flagOf(code: string): string {
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

let cached: readonly PhoneCountry[] | null = null

/** Every country libphonenumber knows, named in English, sorted by name. */
export function phoneCountries(): readonly PhoneCountry[] {
  if (cached) return cached
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    names = null
  }
  cached = getCountries()
    .map((code) => ({
      code,
      name: names?.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`,
      flag: flagOf(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return cached
}

export function isPhoneCountry(code: string): code is CountryCode {
  return (getCountries() as readonly string[]).includes(code)
}

/**
 * A best guess at the visitor's country for the default selection, from the
 * browser's language region (`en-IN` → India). The UK, where the company is
 * registered, when there is no region to go on.
 */
export function guessPhoneCountry(): CountryCode {
  if (typeof navigator !== 'undefined') {
    for (const tag of navigator.languages ?? [navigator.language]) {
      const region = tag?.split('-')[1]?.toUpperCase()
      if (region && isPhoneCountry(region)) return region
    }
  }
  return 'GB'
}

/** Formats the national part as it is typed, in the country's own grouping. */
export function formatNational(value: string, country: CountryCode): string {
  const digits = value.replace(/[^\d]/g, '')
  if (digits.length === 0) return ''
  return new AsYouType(country).input(digits)
}

export function isValidPhone(national: string, country: CountryCode): boolean {
  const digits = national.replace(/[^\d]/g, '')
  return digits.length > 0 && isValidPhoneNumber(digits, country)
}

/** E.164 for a valid number, or null. */
export function toE164(national: string, country: CountryCode): string | null {
  const digits = national.replace(/[^\d]/g, '')
  if (digits.length === 0) return null
  const parsed = parsePhoneNumberFromString(digits, country)
  return parsed && parsed.isValid() ? parsed.number : null
}

/**
 * A number typed or pasted with its own dialling code (`+91 70126 08089`):
 * the country it belongs to and the national part, or null when the code is
 * not recognised yet (for instance while it is still being typed).
 */
export function splitInternational(value: string): { country: CountryCode; national: string } | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('+')) return null
  const parsed = parsePhoneNumberFromString(trimmed)
  if (!parsed?.country) return null
  return { country: parsed.country, national: formatNational(parsed.nationalNumber, parsed.country) }
}

/** Server-side check of a submitted E.164 string. */
export function isValidE164(value: string): boolean {
  if (!/^\+[1-9]\d{6,14}$/.test(value)) return false
  const parsed = parsePhoneNumberFromString(value)
  return parsed !== undefined && parsed.isValid()
}
