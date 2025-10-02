// Custom Fields Utility for Dynamic Form Rendering
class CustomFieldsRenderer {
    constructor() {
        this.cachedFields = new Map();
    }

    // Load custom fields for a specific section
    async loadFieldsForSection(section) {
        try {
            // Check cache first
            if (this.cachedFields.has(section)) {
                return this.cachedFields.get(section);
            }

            const response = await fetch(`/api/custom-fields/section/${section}`);
            const data = await response.json();

            if (data.success) {
                this.cachedFields.set(section, data.fields);
                return data.fields;
            } else {
                console.error('Failed to load custom fields:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error loading custom fields:', error);
            return [];
        }
    }

    // Render custom fields into a container
    async renderFields(containerId, section, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }

        const fields = await this.loadFieldsForSection(section);
        const { group = null, showLabels = true, className = '' } = options;

        // Filter fields by group if specified
        const filteredFields = group ? 
            fields.filter(field => field.placement.group === group) : 
            fields;

        // Sort fields by order
        filteredFields.sort((a, b) => (a.placement.order || 0) - (b.placement.order || 0));

        // Render fields
        container.innerHTML = filteredFields.map(field => this.renderField(field, showLabels, className)).join('');
    }

    // Render a single field
    renderField(field, showLabels = true, className = '') {
        const fieldId = field.id;
        const fieldName = field.name;
        const fieldLabel = field.label;
        const fieldType = field.type;
        const isRequired = field.required;
        const placeholder = field.placeholder || '';
        const helpText = field.helpText || '';
        const cssClass = field.styling?.cssClass || '';
        const width = field.styling?.width || '100%';
        const options = field.options || [];

        const requiredAttr = isRequired ? 'required' : '';
        const requiredLabel = isRequired ? ' <span class="required">*</span>' : '';

        let fieldHTML = '';

        switch (fieldType) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'url':
            case 'password':
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <input type="${fieldType}" 
                               id="${fieldId}" 
                               name="${fieldName}" 
                               class="form-control ${cssClass}" 
                               placeholder="${placeholder}"
                               ${requiredAttr}>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'textarea':
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <textarea id="${fieldId}" 
                                  name="${fieldName}" 
                                  class="form-control ${cssClass}" 
                                  placeholder="${placeholder}"
                                  rows="3"
                                  ${requiredAttr}></textarea>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'select':
                const selectOptions = options.map(option => 
                    `<option value="${option.value}" ${option.isDefault ? 'selected' : ''}>${option.label}</option>`
                ).join('');
                
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <select id="${fieldId}" 
                                name="${fieldName}" 
                                class="form-control ${cssClass}"
                                ${requiredAttr}>
                            <option value="">Select ${fieldLabel}</option>
                            ${selectOptions}
                        </select>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'multiselect':
                const multiSelectOptions = options.map(option => 
                    `<option value="${option.value}" ${option.isDefault ? 'selected' : ''}>${option.label}</option>`
                ).join('');
                
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <select id="${fieldId}" 
                                name="${fieldName}[]" 
                                class="form-control ${cssClass}"
                                multiple
                                ${requiredAttr}>
                            ${multiSelectOptions}
                        </select>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'radio':
                const radioOptions = options.map((option, index) => 
                    `<div class="form-check">
                        <input class="form-check-input" 
                               type="radio" 
                               name="${fieldName}" 
                               id="${fieldId}_${index}" 
                               value="${option.value}"
                               ${option.isDefault ? 'checked' : ''}
                               ${requiredAttr}>
                        <label class="form-check-label" for="${fieldId}_${index}">
                            ${option.label}
                        </label>
                    </div>`
                ).join('');
                
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label>${fieldLabel}${requiredLabel}</label>` : ''}
                        <div class="radio-group">
                            ${radioOptions}
                        </div>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'checkbox':
                const checkboxOptions = options.map((option, index) => 
                    `<div class="form-check">
                        <input class="form-check-input" 
                               type="checkbox" 
                               name="${fieldName}[]" 
                               id="${fieldId}_${index}" 
                               value="${option.value}"
                               ${option.isDefault ? 'checked' : ''}>
                        <label class="form-check-label" for="${fieldId}_${index}">
                            ${option.label}
                        </label>
                    </div>`
                ).join('');
                
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label>${fieldLabel}${requiredLabel}</label>` : ''}
                        <div class="checkbox-group">
                            ${checkboxOptions}
                        </div>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'date':
            case 'time':
            case 'datetime':
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <input type="${fieldType}" 
                               id="${fieldId}" 
                               name="${fieldName}" 
                               class="form-control ${cssClass}"
                               ${requiredAttr}>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            case 'file':
                fieldHTML = `
                    <div class="form-group custom-field ${className}" style="width: ${width}">
                        ${showLabels ? `<label for="${fieldId}">${fieldLabel}${requiredLabel}</label>` : ''}
                        <input type="file" 
                               id="${fieldId}" 
                               name="${fieldName}" 
                               class="form-control-file ${cssClass}"
                               ${requiredAttr}>
                        ${helpText ? `<small class="form-text text-muted">${helpText}</small>` : ''}
                    </div>
                `;
                break;

            default:
                console.warn(`Unknown field type: ${fieldType}`);
                return '';
        }

        return fieldHTML;
    }

    // Validate custom fields
    validateFields(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return { isValid: true, errors: [] };

        const errors = [];
        const fields = container.querySelectorAll('.custom-field');

        fields.forEach(fieldContainer => {
            const input = fieldContainer.querySelector('input, select, textarea');
            if (!input) return;

            const fieldName = input.name;
            const fieldLabel = fieldContainer.querySelector('label')?.textContent?.replace('*', '').trim() || fieldName;
            const isRequired = input.hasAttribute('required');
            const value = input.type === 'checkbox' || input.type === 'radio' ? 
                fieldContainer.querySelector('input:checked')?.value : 
                input.value;

            // Required validation
            if (isRequired && (!value || value.toString().trim() === '')) {
                errors.push(`${fieldLabel} is required`);
            }

            // Type-specific validation
            if (value && input.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`${fieldLabel} must be a valid email address`);
            }

            if (value && input.type === 'url' && !this.isValidUrl(value)) {
                errors.push(`${fieldLabel} must be a valid URL`);
            }

            if (value && input.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors.push(`${fieldLabel} must be a valid number`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Get field values
    getFieldValues(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return {};

        const values = {};
        const fields = container.querySelectorAll('.custom-field');

        fields.forEach(fieldContainer => {
            const input = fieldContainer.querySelector('input, select, textarea');
            if (!input) return;

            const fieldName = input.name;
            const fieldType = input.type;

            if (fieldType === 'checkbox') {
                // Handle checkbox groups
                const checkboxes = fieldContainer.querySelectorAll('input[type="checkbox"]:checked');
                values[fieldName] = Array.from(checkboxes).map(cb => cb.value);
            } else if (fieldType === 'radio') {
                // Handle radio groups
                const radio = fieldContainer.querySelector('input[type="radio"]:checked');
                values[fieldName] = radio ? radio.value : '';
            } else if (fieldType === 'file') {
                // Handle file inputs
                values[fieldName] = input.files[0] || null;
            } else {
                // Handle other input types
                values[fieldName] = input.value;
            }
        });

        return values;
    }

    // Set field values
    setFieldValues(containerId, values) {
        const container = document.getElementById(containerId);
        if (!container) return;

        Object.keys(values).forEach(fieldName => {
            const input = container.querySelector(`[name="${fieldName}"]`);
            if (!input) return;

            const value = values[fieldName];
            const fieldType = input.type;

            if (fieldType === 'checkbox') {
                // Handle checkbox groups
                const checkboxes = container.querySelectorAll(`input[name="${fieldName}"]`);
                checkboxes.forEach(cb => {
                    cb.checked = Array.isArray(value) && value.includes(cb.value);
                });
            } else if (fieldType === 'radio') {
                // Handle radio groups
                const radio = container.querySelector(`input[name="${fieldName}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                // Handle other input types
                input.value = value || '';
            }
        });
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Clear cache
    clearCache() {
        this.cachedFields.clear();
    }
}

// Initialize global custom fields renderer
window.customFieldsRenderer = new CustomFieldsRenderer();
