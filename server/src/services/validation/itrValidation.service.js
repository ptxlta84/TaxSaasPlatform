const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajvErrors = require('ajv-errors');
const mongoose = require('mongoose');

// Load Schema Models
const ITRModel = require('../../models/itr/index');
const Constants = require('../../models/itr/constants');

/**
 * @service ITRValidationService
 * @description Statutory Validation Engine using AJV
 * @statute Section 139(9) - Defective Returns
 */
class ITRValidationService {
    constructor() {
        this.ajv = new Ajv({ allErrors: true, jsonPointers: true });
        addFormats(this.ajv);
        ajvErrors(this.ajv);
        
        this.compileSchemas();
    }

    /**
     * @method compileSchemas
     * @description Compile Mongoose Schemas into AJV Validators
     * Note: Mongoose schemas need to be converted to JSON Schema. 
     * For high performance, we define core JSON schemas manually here 
     * or utilize a converter. For strict compliance, manual definition
     * mapped to CBDT JSON is preferred.
     */
    compileSchemas() {
        // Validation Schema for "Part A - General"
        const partASchema = {
            type: 'object',
            properties: {
                pan: { 
                    type: 'string', 
                    pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
                    errorMessage: 'Invalid PAN Format. Must be 5 Letters, 4 Digits, 1 Letter.'
                },
                filingSection: {
                    type: 'string',
                    enum: Object.values(Constants.FILING_SECTIONS),
                    errorMessage: 'Invalid Filing Section. Must be one of 139(1), 139(4), 139(5).'
                },
                regime: {
                    type: 'string',
                    enum: Object.values(Constants.REGIME),
                    errorMessage: 'Invalid Tax Regime.'
                }
            },
            required: ['pan', 'filingSection'],
            additionalProperties: true
        };
        
        this.validators = {
            partA: this.ajv.compile(partASchema)
        };
    }

    /**
     * @method validateSection139Defects
     * @description Check for common defects under Section 139(9)
     * @param {Object} itrData - The full ITR data object
     * @returns {Array} - List of defects
     */
    validateSection139Defects(itrData) {
        const defects = [];
        
        // Rule: If 139(5) Revised, Original Ack No is mandatory
        if (itrData.partA_General.filingSection === Constants.FILING_SECTIONS.REVISED) {
            if (!itrData.partA_General.originalAcknowledgementNumber) {
                defects.push({
                    errorCode: 'ITR-1-004', // Mapped to Utility Code
                    message: 'Original Acknowledgement Number is mandatory for Revised Return u/s 139(5)',
                    field: 'partA_General.originalAcknowledgementNumber'
                });
            }
        }
        
        // Rule: If New Regime Opt-Out, Form 10-IEA details mandatory (For Business ITR)
        if (itrData.partA_General.optedOutOfNewRegime) {
             // Logic check only for ITR-3/4
             if (['ITR-3', 'ITR-4'].includes(itrData.itrFormType) && !itrData.partA_General.form10IEADetails.acknowledgementNumber) {
                 defects.push({
                     errorCode: 'ITR-COMMON-002',
                     message: 'Form 10-IEA details missing for opting out of New Regime',
                     field: 'partA_General.form10IEADetails'
                 });
             }
        }

        return defects;
    }

    /**
     * @method validate
     * @param {Object} data - ITR Data Payload
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validate(data) {
        const errors = [];
        
        // 1. Schema Validation (AJV)
        const validPartA = this.validators.partA(data.partA_General || {});
        if (!validPartA) {
            this.validators.partA.errors.forEach(err => {
                errors.push({
                    type: 'SCHEMA_ERROR',
                    message: err.message,
                    path: `partA_General${err.instancePath}`
                });
            });
        }
        
        // 2. Business Logic Validation (Defects)
        const businessDefects = this.validateSection139Defects(data);
        errors.push(...businessDefects);

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new ITRValidationService();
