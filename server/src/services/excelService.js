const xlsx = require('xlsx');

exports.generateITRExcel = (itr) => {
    const wb = xlsx.utils.book_new();

    // SHEET 1: INCOME DETAILS
    const incomeData = [
        ['Source', 'Amount (INR)', 'Description'],
        ['Salary (Gross)', itr.income.salary.gross || 0, 'Gross Salary from Form 16'],
        ['Salary (Net)', itr.income.salary.net || 0, 'Net Taxable Salary'],
        ['House Property', itr.income.houseProperty || 0, 'Rental Income / Loss'],
        ['Other Sources', itr.income.otherSources || 0, 'Interest, Dividend etc.'],
        ['Business', itr.income.business || 0, 'Business / Profession Income'],
        ['Capital Gains', itr.income.capitalGains || 0, 'Short/Long Term Gains'],
        ['Total Income', (itr.income.salary.net || 0) + (itr.income.otherSources || 0) + (itr.income.houseProperty || 0), 'Sum of all sources']
    ];
    const incomeSheet = xlsx.utils.aoa_to_sheet(incomeData);
    xlsx.utils.book_append_sheet(wb, incomeSheet, 'Income Details');

    // SHEET 2: DEDUCTIONS
    const deductionData = [
        ['Section', 'Claimed Amount (INR)', 'Max Limit (INR)', 'Proof Required'],
        ['80C', itr.deductions.section80C || 0, 150000, 'LIC, PPF, EPF'],
        ['80D', itr.deductions.section80D || 0, 100000, 'Medical Insurance'],
        ['HRA', itr.deductions.hra || 0, 'Actual', 'Rent Receipts'],
        ['80G', itr.deductions.section80G || 0, 'Varied', 'Donation Receipt'],
        ['Total Deductions', (itr.deductions.section80C || 0) + (itr.deductions.section80D || 0) + (itr.deductions.hra || 0), '', '']
    ];
    const deductionSheet = xlsx.utils.aoa_to_sheet(deductionData);
    xlsx.utils.book_append_sheet(wb, deductionSheet, 'Deductions');

    // SHEET 3: TAX CALCULATION
    const taxData = [
        ['Description', 'Amount (INR)'],
        ['Taxable Income', itr.computation.taxableIncome],
        ['Tax Payable', itr.computation.taxPayable],
        ['Cess (4%)', itr.computation.cess],
        ['Total Liability', itr.computation.totalTaxLiability],
        ['Taxes Paid (TDS)', itr.computation.tdsCredit || 0],
        ['Net Payable', itr.computation.amountPayable],
        ['Refund Due', itr.computation.refundDue]
    ];
    const taxSheet = xlsx.utils.aoa_to_sheet(taxData);
    xlsx.utils.book_append_sheet(wb, taxSheet, 'Tax Calculation');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
