// Rotinas fica disponível em produção. Durante uma manutenção, a rota pode
// ser removida do menu sem esconder a página já publicada.
export function isRoutineFeatureEnabled() {
  return true;
}
