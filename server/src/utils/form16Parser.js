const pdf = require('pdf-parse');

const parseForm16 = async (buffer) => {
    try {
        const data = await pdf(buffer);
        const text = data.text;

        // Regex Patterns for Form-16 (Part B usually)
        // Note: These patterns attempt to catch standard formats but might vary by employer
        
        // 1. Gross Salary
        // Matches "Gross Salary", "Gross Total Income", or "Income chargeable under the head 'Salaries'"
        // Looks for a number at the end of the line or next line
        const grossSalaryPattern = /(?:Gross Salary|Gross Total Income|Income chargeable under the head 'Salaries')[\s\S]{0,100}?([\d,]+\.?\d*)/i;
        
        // 2. Exemptions u/s 10
        // Matches "Less: Allowance to the extent exempt u/s 10" or just section 10 mentions
        const exemptSection10Pattern = /(?:Less: Allowance to the extent exempt u\/s 10|Section 10)[\s\S]{0,100}?([\d,]+\.?\d*)/i;

        // 3. Deductions u/s 16 (Standard Deduction + Prof Tax + Entertainment)
        // Matches "Deductions under section 16" and captures the total
        const deductionsSection16Pattern = /(?:Deductions under section 16)[\s\S]{0,150}?([\d,]+\.?\d*)/i;

        // 4. Income Tax / TDS
        // Matches "Total Tax Payable" or "Tax Deducted at Source"
        const tdsPattern = /(?:Total Tax Payable|Tax Deducted at Source|Total TDS)[\s\S]{0,50}?([\d,]+\.?\d*)/i;
        
        // Helper to extract and parse float
        const extractValue = (pattern) => {
            const match = text.match(pattern);
            if (match && match[1]) {
                // Remove commas and parse
                return parseFloat(match[1].replace(/,/g, ''));
            }
            return 0;
        };

        const result = {
            grossSalary: extractValue(grossSalaryPattern),
            exemptionsSection10: extractValue(exemptSection10Pattern),
            deductionsSection16: extractValue(deductionsSection16Pattern),
            tdsDeducted: extractValue(tdsPattern),
            // Metadata
            textLength: text.length,
            pageCount: data.numpages
        };

        console.log('Form-16 Extracted Data:', result);
        return result;

    } catch (error) {
        console.error('Error parsing Form-16 PDF:', error);
        throw new Error('Failed to parse Form-16 PDF');
    }
};

module.exports = { parseForm16 };
