export function truncate(str, maxLength, separator = "...") {
  if (str.length <= maxLength || maxLength === 0) {
    return str;
  }

  const showLength = maxLength - separator.length;

  const front = Math.ceil(showLength / 2);
  const back = Math.floor(showLength / 2);

  return str.substring(0, front) + separator + str.substring(str.length - back);
}
