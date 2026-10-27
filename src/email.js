// Decodes the support links rendered by the email partials (src/partials.js).
// The address exists only as base64 parts in data-u and data-d, so neither the
// HTML nor this bundle contains it in plain text.

const decode = (s) => {
  try { return atob(s || ''); } catch { return ''; }
};

export function revealEmails(root = document) {
  root.querySelectorAll('a.js-obfuscated-email[data-u][data-d]').forEach((a) => {
    const user = decode(a.dataset.u);
    const domain = decode(a.dataset.d);
    if (!user || !domain) return;
    const address = [user, domain].join(String.fromCharCode(64));
    const subject = a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : '';
    a.href = `mailto:${address}${subject}`;
    if (!a.hasAttribute('data-keep-label')) a.textContent = address;
    a.classList.remove('js-obfuscated-email');
  });
}

// Module scripts run after parsing, but cover the DOMContentLoaded path as well.
revealEmails();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => revealEmails());
