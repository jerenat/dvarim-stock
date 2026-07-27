// src/utils/format.js

export function formatCurrency(valor, moneda = "ARS", locale = "es-AR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatNumber(valor, locale = "es-AR") {
  return new Intl.NumberFormat(locale).format(valor);
}