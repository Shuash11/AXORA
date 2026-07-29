function validateCount(count) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('count must be a positive integer');
  }
}

export function normalizeIndex(index, count) {
  validateCount(count);
  return ((index % count) + count) % count;
}

export function nextIndex(current, count) {
  return normalizeIndex(current + 1, count);
}

export function previousIndex(current, count) {
  return normalizeIndex(current - 1, count);
}

export function relativeOffset(index, activeIndex, count) {
  validateCount(count);
  const offset = normalizeIndex(index - activeIndex, count);
  return offset > count / 2 ? offset - count : offset;
}
