export function useRepositoryClassGeneric<M, S, O>(
  mongoService: M,
  sqlService: S,
  ormService: O,
): M | S | O {
  if (process.env.REPO_TYPE === 'MONGO') {
    return mongoService;
  } else if (process.env.REPO_TYPE === 'SQL') {
    return sqlService;
  } else if (process.env.REPO_TYPE === 'ORM') {
    return ormService;
  } else return ormService; // by DEFAULT if not in enum
}
