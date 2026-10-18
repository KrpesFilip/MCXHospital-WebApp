  export function formatCoordinate(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(7);
  }