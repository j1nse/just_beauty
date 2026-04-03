export function toAssetPath(input: string) {
  if (!input) {
    return input;
  }

  if (input.startsWith("http")) {
    return input;
  }

  const normalizedBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${normalizedBase}${input.replace(/^\/+/, "")}`;
}
