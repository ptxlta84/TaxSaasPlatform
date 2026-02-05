const mongoose = require('mongoose');

/**
 * @schema ScheduleCG
 * @description Maps to "Schedule CG" (Capital Gains)
 * @statute Sections 45 to 55A
 */
const scheduleCGSchema = new mongoose.Schema({
    
    // 1. Short Term Capital Gains (STCG)
    stcg: {
        landAndBuilding_30pct: {
            saleConsideration: Number,
            valueUtilsStampValAuth: Number, // Section 50C
            costOfAcquisition: Number,
            costOfImprovement: Number,
            expenditureOnTransfer: Number,
            gain: Number
        },
        equityShares_111A_15pct: {
             fullValueConsideration: Number,
             costOfAcquisition: Number,
             gain: Number
        },
        otherAssets: {
            gain: Number
        },
        totalSTCG: { type: Number, default: 0 }
    },

    // 2. Long Term Capital Gains (LTCG)
    ltcg: {
         landAndBuilding_20pct: {
            saleConsideration: Number,
            valueUtilsStampValAuth: Number,
            indexedCostAcquisition: Number,
            indexedCostImprovement: Number,
            expenditureOnTransfer: Number,
            gain: Number
         },
         bondsDebentures_10pct: {
             gain: Number
         },
         equityShares_112A_10pct: {
             fullValueConsideration: Number,
             costOfAcquisition: Number, 
             fairMarketValue_31Jan2018: Number, // Grandfathering clause
             gain: Number
         },
         totalLTCG: { type: Number, default: 0 }
    },

    // 3. Current Year Losses Set-off
    lossSetOff: {
        stcgLossSetOff: Number,
        ltcgLossSetOff: Number 
    },

    // 4. Quarterly Breakup for Interest Calculation (Section 234C)
    accrualOfIncome: {
        upto15Jun: { stcg: Number, ltcg: Number },
        upto15Sep: { stcg: Number, ltcg: Number },
        upto15Dec: { stcg: Number, ltcg: Number },
        upto15Mar: { stcg: Number, ltcg: Number },
        upto31Mar: { stcg: Number, ltcg: Number }
    },

    // Final Head Income
    incomeFromCapitalGains: { type: Number, default: 0 }

}, { _id: false });

module.exports = scheduleCGSchema;
