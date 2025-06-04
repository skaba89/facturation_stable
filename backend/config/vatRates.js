// Placeholder for VAT Rate Configuration

const vatRates = [
  { value: 0, label: '0% (VAT not applicable / exempt)' },
  { value: 0.05, label: '5%' },
  { value: 0.055, label: '5.5%' },
  { value: 0.10, label: '10%' },
  { value: 0.20, label: '20%' },
  { value: 0.30, label: '30%' }
  // Add more rates as needed, possibly based on country/region in future
];

/**
 * Validates if a given VAT rate value exists in the predefined rates.
 * @param {number} rateValue - The VAT rate value to validate (e.g., 0.05 for 5%).
 * @returns {boolean} - True if the rate value is valid, false otherwise.
 */
const isValidVatRate = (rateValue) => {
  if (typeof rateValue !== 'number') {
    return false;
  }
  return vatRates.some(rate => rate.value === rateValue);
};

/**
 * Gets the details for a specific VAT rate.
 * @param {number} rateValue - The value of the VAT rate.
 * @returns {object|undefined} - The VAT rate object or undefined if not found.
 */
const getVatRateDetails = (rateValue) => {
  return vatRates.find(rate => rate.value === rateValue);
};

module.exports = {
  vatRates,
  isValidVatRate,
  getVatRateDetails,
};
