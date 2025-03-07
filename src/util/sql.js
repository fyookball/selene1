// resultToJson: turns SQLite result into a consumable object
/* result:
 * [
 *  {
 *    columns: ["id", "name", ...],
 *    values: [
 *      [1, "Selene", ...],
 *      [2, ...],
 *      ...
 *    ]
 *  }
 *]
 *
 * mapped:
 * [
 *   [ { id: 1 }, { name: "Selene" }, ...],
 *   [ { id: 2 }, ...],
 *   ...
 * ]
 *
 * reduced:
 * [
 *   { id: 1, name: "Selene", ...},
 *   { id: 2, ...},
 *   ...
 * ]
 **/

export function resultToJson(result) {
  // result is empty set (empty array)
  if (result.length === 0) {
    return result;
  }

  const mapped = result[0].values.map((val) =>
    result[0].columns.map((col, j) => ({ [result[0].columns[j]]: val[j] }))
  );

  const reduced = mapped.map((m) =>
    m.reduce((acc, cur) => ({ ...acc, ...cur }), {})
  );

  //Log.debug("resultToJson", result, mapped, reduced);
  return reduced;
}
