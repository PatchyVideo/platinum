import type { LocationQueryValue } from 'vue-router'

export const pickFirstQuery = (query: LocationQueryValue | LocationQueryValue[] | undefined) =>
  Array.isArray(query) ? query[0] : query
