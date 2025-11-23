export const validatePlate = (raw) => {
  return /^[A-Z]{3}\d{3}[A-Z]$/.test(raw.toUpperCase());
};