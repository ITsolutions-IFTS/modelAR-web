export const buildArQrUrl = (uid: string): string => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/ar/${uid}`;
};
