import type { LocationQueryValue } from 'vue-router'

export function pickFirstQuery(query: LocationQueryValue | LocationQueryValue[] | undefined) {
  return Array.isArray(query) ? query[0] : query
}
