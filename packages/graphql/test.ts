export function creatGQL(): void {
  return
}

// GQL Scalar
const date = {
  parseValue(value: number | string | null): Date {
    return new Date(<string>value)
  },
  serialize(value: Date): string {
    return value.toISOString()
  },
}

export const scalars = [date]
