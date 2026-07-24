// Basit global bildirim (toast) yayını. React'e bağımlı değil, bu yüzden
// servis/interceptor katmanından da güvenle çağrılabilir.
export function notify(message, type = 'error') {
  if (typeof window !== 'undefined' && message) {
    window.dispatchEvent(new CustomEvent('voltify_toast', { detail: { message, type } }));
  }
}
