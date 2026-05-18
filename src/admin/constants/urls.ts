export const LOCAL_BASE_URL = 'http://localhost:5173'
export const PROD_BASE_URL = 'https://modelar.itsolutions.com.ar'

export const buildArQrUrl = (uid: string) => `${LOCAL_BASE_URL}/#/ar/${uid}`
