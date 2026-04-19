export function cn(...parts) {
  return parts
    .flatMap((part) => {
      if (!part) return [];
      if (Array.isArray(part)) return part;
      if (typeof part === 'object') {
        return Object.entries(part)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([key]) => key);
      }
      return [String(part)];
    })
    .join(' ')
    .trim();
}

