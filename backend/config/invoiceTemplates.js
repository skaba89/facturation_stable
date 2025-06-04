// Placeholder for Invoice Template Configuration

const invoiceTemplates = [
  { id: 'modern', name: 'Modern', path: 'templates/modern.html' }, // path is conceptual for HTML template file
  { id: 'classic', name: 'Classic', path: 'templates/classic.html' },
  { id: 'simple', name: 'Simple', path: 'templates/simple.html' }
];

/**
 * Validates if a given template ID exists in the configuration.
 * @param {string} templateId - The ID of the template to validate.
 * @returns {boolean} - True if the template ID is valid, false otherwise.
 */
const isValidTemplate = (templateId) => {
  return invoiceTemplates.some(template => template.id === templateId);
};

/**
 * Gets the details for a specific template.
 * @param {string} templateId - The ID of the template.
 * @returns {object|undefined} - The template object or undefined if not found.
 */
const getTemplateDetails = (templateId) => {
  return invoiceTemplates.find(template => template.id === templateId);
};

module.exports = {
  invoiceTemplates,
  isValidTemplate,
  getTemplateDetails,
};
