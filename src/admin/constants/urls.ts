/**
 * Origin público de la web. En prod se setea VITE_PUBLIC_WEB_URL (ej.
 * https://model-ar-web.vercel.app) para que el QR apunte siempre al dominio
 * real, sin importar desde dónde se genere (localhost, preview, dominio custom).
 * Si no está seteada, cae al origin actual del browser.
 */
const publicWebBase = (): string => {
  const configured = import.meta.env.VITE_PUBLIC_WEB_URL as string | undefined;
  if (configured) return configured.replace(/\/+$/, '');
  return `${window.location.origin}${window.location.pathname}`.replace(
    /\/+$/,
    ''
  );
};

export const buildArQrUrl = (uid: string): string => {
  return `${publicWebBase()}/#/ar/${uid}`;
};
