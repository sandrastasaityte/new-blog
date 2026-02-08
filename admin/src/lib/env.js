/* -------------------------------------------
   Environment Helpers
------------------------------------------- */

function getEnv(key, fallback = "") {
  const value = import.meta.env[key];

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

/* -------------------------------------------
   Public Config
------------------------------------------- */

export const API_URL = getEnv(
  "VITE_API_URL",
  "http://localhost:4000"
);

/* -------------------------------------------
   App Mode Helpers
------------------------------------------- */

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const APP_MODE = import.meta.env.MODE;

/* -------------------------------------------
   Debug Helper
------------------------------------------- */

if (IS_DEV && !import.meta.env.VITE_API_URL) {
  console.warn("⚠ VITE_API_URL not defined → using localhost fallback");
}
