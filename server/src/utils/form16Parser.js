const pdf = require('pdf-parse');

const parseForm16 = async (buffer) => {
    try {
        const data = await pdf(buffer);
        const text = data.text;
        
        // Debug: Log first 500 chars to see headers (in a real scenario)
        // console.log('PDF Text Start:', text.substring(0, 500));

        // --- Regex Patterns (Enhanced for LIC/TRACES) ---

        // Helper: Convert plain string to regex pattern that allows flexible whitespace
        const flex = (str) => str.replace(/ /g, '\\s+').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

        // Helper to find value after a pattern (flexible for whitespace/newlines)
        const extractValue = (patterns) => {
            for (const pattern of patterns) {
                // Make the input pattern flexible regarding spaces
                const regexPattern = typeof pattern === 'string' ? flex(pattern) : pattern;
                
                // Allow up to 200 chars of noise (newline, other labels) between key and value
                const regex = new RegExp(`${regexPattern}[\\s\\S]{0,200}?([\\d,]+\\.?\\d*)`, 'i');
                const match = text.match(regex);
                if (match && match[1]) {
                    const val = parseFloat(match[1].replace(/,/g, ''));
                    // Filter out small numbers unless it's likely a small allowance, 
                    // generally salary components are > 100 or at least non-zero integers usually
                    if (!isNaN(val)) return val;
                }
            }
            return 0;
        };

        const extractString = (headers) => {
             for (const header of headers) {
                const regexPattern = flex(header);
                // Look for Header -> optional newline/space -> Capture Line
                const regex = new RegExp(`${regexPattern}[\\s\\S]{0,50}?(\\n|\\r|^)([\\w\\s,.-]+)(?:\\n|\\r|PAN|TAN)`, 'i');
                const match = text.match(regex);
                if (match && match[2]) {
                    let val = match[2].trim();
                    // Cleanup common garbage line numbers or dates if caught
                    if (val.length > 5) return val;
                }
             }
             return 'Unknown Employer';
        };

        // 1. Gross Salary (17(1))
        const grossSalary = extractValue([
            "Salary as per provisions contained in section 17(1)",
            "Gross Salary", 
            "Gross Total Income"
        ]);

        // 2. Exemptions u/s 10
        const exemptionsSection10 = extractValue([
            "Less: Allowance to the extent exempt u/s 10",
            "Total amount of exemption claimed under section 10",
            "Section 10" 
        ]);

        // 3. Deductions u/s 16
        // Standard Deduction u/s 16(ia)
        const standardDeduction = extractValue([
            "Standard deduction under section 16(ia)",
            "Standard deduction u/s 16(ia)",
            "Standard deduction"
        ]);
        
        // Professional Tax u/s 16(iii)
        const professionalTax = extractValue([
            "Tax on employment",
            "Professional Tax",
            "entertainment allowance"
        ]);

        const deductionsSection16 = standardDeduction + professionalTax;

        // 4. Taxable Salary
        const taxableSalary = extractValue([
            "Income chargeable under the head Salaries", // quotes might be messed up in PDF text
            "Income chargeable under the head 'Salaries'",
            "Income chargeable under the head \"Salaries\"",
            "Net Taxable Income"
        ]);

        // 5. TDS
        const tdsDeducted = extractValue([
            "Total Tax Payable",
            "Tax Deducted at Source", 
            "Total TDS",
            "Total tax deducted"
        ]);

        // 6. Employer Details
        const employerName = extractString([
            "Name and address of the Employer", 
            "Name and address of the Deductor"
        ]);
        
        // TAN
        // TAN pattern is standard: 4 alpha, 5 numeric, 1 alpha
        const tanMatch = text.match(/[A-Z]{4}\d{5}[A-Z]/);
        const tan = tanMatch ? tanMatch[0] : "";


        // Detect Form Type
        const isPartA = flex("Certificate under section 203").test || /Certificate\s+under\s+section\s+203|Quarter-wise\s+break\s+up\s+of\s+TDS|TDS\s+Deducted\s+at\s+Source/i.test(text);
        
        // Part B check
        const isPartB = /(?:Salary\s+as\s+per\s+provisions|Income\s+chargeable\s+under\s+the\s+head)/i.test(text);

        const result = {
            isPartA,
            isPartB,
            employer: {
                name: employerName !== 'Unknown Employer' ? employerName : "Employer (Name not found)",
                tan: tan,
                address: "" 
            },
            grossSalary,
            exemptionsSection10,
            deductionsSection16,
            standardDeduction,
            professionalTax,
            taxableSalary, 
            tdsDeducted,
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
