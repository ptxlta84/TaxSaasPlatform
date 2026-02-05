const mongoose = require('mongoose');

/**
 * @schema ScheduleHP
 * @description Maps to "Schedule HP" (Income from House Property)
 * @statute Sections 22 to 27 of Income-tax Act, 1961
 */
const scheduleHPSchema = new mongoose.Schema({
    // Property Details
    address: {
        flatDoorBlock: String,
        roadStreet: String,
        areaLocality: String,
        townCity: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true, match: /^\d{6}$/ }
    },
    
    // Ownership
    isCoOwned: { type: Boolean, default: false },
    mySharePercentage: { type: Number, default: 100 },
    coOwners: [{
        name: String,
        pan: { type: String, match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
        percentage: Number
    }],

    // Property Type
    propertyType: {
        type: String,
        enum: ['SELF_OCCUPIED', 'LET_OUT', 'DEEMED_LET_OUT'],
        required: true
    },

    // Computation of Income
    grossRentReceived: { type: Number, default: 0 }, // For Let Out
    taxPaidToLocalAuthority: { type: Number, default: 0 }, // Municipal Taxes
    
    netAnnualValue: { type: Number, default: 0 }, // Gross Rent - Municipal Taxes

    // Deductions u/s 24
    deductions: {
        standardDeduction_24a: { type: Number, default: 0 }, // 30% of NAV
        interestOnBorrowedCapital_24b: { type: Number, default: 0 }, // Max 2L for Self Occupied
        preConstructionInterest: { type: Number, default: 0 } // 1/5th allowed
    },

    // Arrears of Rent (Section 25A)
    arrearsUnrealizedRentReceived: { type: Number, default: 0 },
    
    // Final Income
    incomeFromHouseProperty: { type: Number, default: 0 } // Can be negative (Loss)

}, { _id: false });

module.exports = scheduleHPSchema;
