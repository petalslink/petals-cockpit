let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};
