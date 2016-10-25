let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

// generate a UUID
export function generateUuidV4(a = null) {
  /* tslint:disable */
  return a?(a^Math.random()*16>>a/4)
    .toString(16):(<any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateUuidV4);
  /* tslint:enable */
}

// replace IDs in the json received
// by generated UUID
export function replaceIds(obj) {
  if (typeof obj.id !== 'undefined') {
    obj.id = generateUuidV4(null);
  }

  for (let i in obj) {
    if (typeof obj[i] === 'object') {
      replaceIds(obj[i]);
    }
  }
}
