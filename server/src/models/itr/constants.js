/**
 * @file constants.js
 * @description Statutory Constants & Enums for Income Tax Return (AY 2025-26)
 * @author Senior CA & Architect
 */

module.exports = {
    ITR_FORMS: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'],
    
    // Section 139 Filing Types
    FILING_SECTIONS: {
        ON_TIME: '139(1)',
        BELATED: '139(4)',
        REVISED: '139(5)',
        DEFECTIVE_RECTIFICATION: '139(9)',
        RESPONSE_TO_NOTICE: '142(1)'
    },

    // Residential Status (Section 6)
    RESIDENTIAL_STATUS: {
        RESIDENT: 'ROR', // Resident Ordinary
        RESIDENT_BUT_NOT_ORDINARY: 'RNOR',
        NON_RESIDENT: 'NR'
    },

    // Old vs New Regime (Section 115BAC)
    REGIME: {
        OLD: 'OLD',
        NEW: 'NEW' // Default for AY 2024-25 onwards
    },

    // Status of Person (Section 2(31))
    PERSON_STATUS: {
        INDIVIDUAL: 'I',
        HUF: 'H',
        FIRM: 'F',
        LLP: 'L',
        COMPANY: 'C',
        AOP_BOI: 'A',
        LOCAL_AUTHORITY: 'LA',
        ARTIFICIAL_JURIDICAL: 'AJP'
    },
    
    // ITR Status Enums (Workflow)
    ITR_STATUS: ['DRAFT', 'VALIDATED', 'CALCULATED', 'E_VERIFIED', 'SUBMITTED', 'PROCESSED']
};
