const mongoose = require('mongoose');
const { FILING_SECTIONS, RESIDENTIAL_STATUS, PERSON_STATUS, REGIME } = require('../constants');

/**
 * @schema PartAGeneral
 * @description Maps to "Part A - General Information" of CBDT ITR Schema
 * Covers: Personal Info, Filing Status, Residential Status, 115BAC Selection
 */
const partAGeneralSchema = new mongoose.Schema({
    // Personal Information
    pan: { 
        type: String, 
        required: true, 
        uppercase: true, 
        match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ 
    },
    aadhaarNumber: { 
        type: String, 
        match: /^\d{12}$/ // Optional for Non-Residents
    },
    name: { type: String, required: true },
    dateOfBirthOrIncorporation: { type: Date, required: true },
    
    // Contact Info (Critical for 143(1) intimation)
    address: {
        flatDoorBlock: String,
        premisesName: String,
        roadStreet: String,
        areaLocality: String,
        townCity: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true, match: /^\d{6}$/ },
        mobile1: { type: String, required: true },
        email1: { type: String, required: true }
    },

    // Filing Status
    filingSection: { 
        type: String, 
        enum: Object.values(FILING_SECTIONS), 
        required: true 
    },
    filedInResponseToNotice: { type: Boolean, default: false },
    noticeNumber: String, // DIN
    
    // For 139(5) - Revised Return
    originalAcknowledgementNumber: String,
    originalDateOfFiling: Date,

    // Residential Status (Section 6)
    residentialStatus: {
        type: String,
        enum: Object.values(RESIDENTIAL_STATUS),
        required: true
    },
    
    // Section 115BAC (New Tax Regime)
    // Note: Default is NEW from AY 2024-25. Opting OUT requires Form 10-IEA for Business Income
    regime: {
        type: String,
        enum: Object.values(REGIME),
        default: REGIME.NEW
    },
    optedOutOfNewRegime: { type: Boolean, default: false },
    form10IEADetails: {
        acknowledgementNumber: String,
        dateOfFiling: Date
    },

    // Status of Person
    status: {
        type: String,
        enum: Object.values(PERSON_STATUS),
        default: PERSON_STATUS.INDIVIDUAL
    },
    
    // Aadhar Enrollment ID (if Aadhar not allotted)
    aadhaarEnrollmentId: String

}, { _id: false }); // Embedded schema

module.exports = partAGeneralSchema;
