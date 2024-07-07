export function countVisibleItems(element: Element, itemHeight: number, itemGap: number = 0): number {
  const elementStyles = getComputedStyle(element);
  const height = parseInt(elementStyles.getPropertyValue('height'));
  return Math.round(height / (itemHeight + itemGap));
}