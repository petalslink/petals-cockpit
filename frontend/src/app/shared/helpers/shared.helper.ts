// generate a UUID
export function generateUuidV4(a = null) {
  /* tslint:disable */
  return a?(a^Math.random()*16>>a/4)
    .toString(16):(<any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateUuidV4);
  /* tslint:enable */
}

// careful this modify the object in-place
export function toJavascriptMap(map: any) {
  const allIds = Object.keys(map);
  allIds.forEach(id => {
    map[id].id = id;
  });
  return {
    byId: map,
    allIds: allIds
  };
}
