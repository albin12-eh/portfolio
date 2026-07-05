/**
 * Lightweight event-based toast trigger. Any component can call
 * `showMatrixToast("message")` without importing or mounting state —
 * `MatrixEasterEggs` listens for the `matrix:toast` event and renders it.
 */
export function showMatrixToast(message: string): void {
  window.dispatchEvent(new CustomEvent("matrix:toast", { detail: { message } }));
}
