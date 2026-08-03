// A flag fica fechada em produção até a rotina passar pela homologação.
// Em preview/dev ela fica disponível para revisão visual e funcional.
export function isRoutineFeatureEnabled() {
  if (process.env.ROUTINE_FEATURE_ENABLED === 'true' || process.env.NEXT_PUBLIC_ROUTINE_FEATURE_ENABLED === 'true') return true;
  if (process.env.ROUTINE_FEATURE_ENABLED === 'false' || process.env.NEXT_PUBLIC_ROUTINE_FEATURE_ENABLED === 'false') return false;
  return process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview';
}
