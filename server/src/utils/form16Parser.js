const pdf = require('pdf-parse');

const parseForm16 = async (buffer) => {
    try {
        const data = await pdf(buffer);
        const text = data.text;

        // Regex Patterns for Form-16 (Enhanced for TRACES/LIC)
        
        // Employer Details
        const employerNamePattern = /(?:Name and address of the Employer|Name and address of the Deductor)[\s\S]{0,50}?(\n|^)([\w\s,.-]+)(?:PAN|TAN)/i;
        const tanPattern = /(?:TAN of the Deductor|TAN of the Employer)[\s\S]{0,50}?([A-Z]{4}\d{5}[A-Z])/i;
        const addressPattern = /(?:Name and address of the Employer|Name and address of the Deductor)[\s\S]*?\n([\s\S]{0,100}?)(?:PAN|TAN)/i; // A bit risky, simplify if needed

        // 1. Gross Salary (17(1))
        // Matches "Salary as per provisions contained in section 17(1)" or "Gross Salary"
        const grossSalaryPattern = /(?:Salary as per provisions contained in section 17\(1\)|Gross Salary|Gross Total Income)[\s\S]{0,100}?([\d,]+\.?\d*)/i;
        
        // 2. Exemptions u/s 10
        const exemptSection10Pattern = /(?:Less: Allowance to the extent exempt u\/s 10|Section 10|Total amount of exemption claimed under section 10)[\s\S]{0,100}?([\d,]+\.?\d*)/i;

        // 3. Deductions u/s 16 (Standard Deduction + Prof Tax)
        // Specific: Standard deduction u/s 16(ia)
        const stdDeductionPattern = /(?:Standard deduction under section 16\(ia\)|Standard Deduction)[\s\S]{0,100}?([\d,]+\.?\d*)/i;
        const profTaxPattern = /(?:Tax on employment|Professional Tax)[\s\S]{0,100}?([\d,]+\.?\d*)/i;
        
        // 4. Taxable Income / Income Chargeable under Salaries
        const taxableSalaryPattern = /(?:Income chargeable under the head "Salaries"|Income chargeable under the head 'Salaries'|Net Taxable Income)[\s\S]{0,100}?([\d,]+\.?\d*)/i;

        // 5. TDS
        const tdsPattern = /(?:Total Tax Payable|Tax Deducted at Source|Total TDS|Total tax deducted)[\s\S]{0,50}?([\d,]+\.?\d*)/i;
        
        // Helper to extract and parse string/float
        const extractString = (pattern) => {
             const match = text.match(pattern);
             // For Name/Address, we want the captured group, usually group 2 if group 1 is newline
             if (match) {
                 return (match[2] || match[1] || '').trim().replace(/\n/g, ', ');
             }
             return 'Unknown Employer';
        };
        
        const extractValue = (pattern) => {
            const match = text.match(pattern);
            if (match) {
                // Find the first capturing group that looks like a number
                for (let i = 1; i < match.length; i++) {
                    if (match[i] && /[\d,]+\.?\d*/.test(match[i])) {
                        return parseFloat(match[i].replace(/,/g, '')); 
                    }
                }
            }
            return 0;
        };

        // Detect Form Type
        const isPartA = /Certificate under section 203|Quarter-wise break up of TDS|TDS Deducted at Source/i.test(text);
        const isPartB = /(?:Salary as per provisions contained in section 17\(1\)|Income chargeable under the head "Salaries")/i.test(text); // Stronger check for Part B

        const result = {
            isPartA,
            isPartB,
            employer: {
                name: extractString(employerNamePattern),
                tan: (text.match(tanPattern) || [])[1] || '',
                address: '' // extractString(addressPattern) - Simplify to avoid junk
            },
            grossSalary: extractValue(grossSalaryPattern),
            exemptionsSection10: extractValue(exemptSection10Pattern),
            deductionsSection16: extractValue(stdDeductionPattern) + extractValue(profTaxPattern), // Sum detected deductions
            standardDeduction: extractValue(stdDeductionPattern),
            professionalTax: extractValue(profTaxPattern),
            taxableSalary: extractValue(taxableSalaryPattern), // Explicit Taxable
            tdsDeducted: extractValue(tdsPattern),
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
