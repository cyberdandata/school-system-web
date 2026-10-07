/**
 * Utility formatters used across the app.
 * Keep implementations small and dependency-free for both Node and browser builds.
 */

export function formatUGX(value: number | null | undefined): string {
  const amount = Number(value) || 0;
  try {
    // UGX has no fractional units; show grouped thousands and a UGX currency marker
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    // Fallback for environments without full Intl support
    return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
  }
}
