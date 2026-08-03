// A flag pode ser desligada explicitamente durante uma manutenção.
// Sem um valor definido, a rota fica disponível também em produção.
export function isRoutineFeatureEnabled() {
  if (process.env.ROUTINE_FEATURE_ENABLED === 'true' || process.env.NEXT_PUBLIC_ROUTINE_FEATURE_ENABLED === 'true') return true;
  if (process.env.ROUTINE_FEATURE_ENABLED === 'false' || process.env.NEXT_PUBLIC_ROUTINE_FEATURE_ENABLED === 'false') return false;
  return true;
}
