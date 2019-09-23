export function processSize(size: any) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}
