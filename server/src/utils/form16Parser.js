
const pdf = require('pdf-parse');

const parseForm16 = async (buffer) => {
    try {
        const data = await pdf(buffer);
        let text = data.text;
        // Try to guess methods
        // console.log("data.text type:", typeof data.text);
        // console.log("data.getText type:", typeof data.getText);

        if (typeof data.text === 'string') text = data.text;
        else if (data.doc && typeof data.doc.text === 'string') text = data.doc.text;
        else text = ""; // Fallback
        
        // Debug: Log first 500 chars to see headers (in a real scenario)
        // console.log('PDF Text Start:', text.substring(0, 500));

        // --- Regex Patterns (Enhanced for LIC/TRACES) ---

        // Helper: Convert plain string to regex pattern that allows flexible whitespace
        // Helper: Convert plain string to regex pattern that allows flexible whitespace
        // Also escape parens automatically
        const flex = (str) => str.replace(/ /g, '\\s+').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

        // Helper to find value after a pattern (flexible for whitespace/newlines)
        const extractValue = (patterns) => {
            for (const pattern of patterns) {
                // Make the input pattern flexible regarding spaces
                const regexPattern = typeof pattern === 'string' ? flex(pattern) : pattern;
                
                // Allow up to 1500 chars of noise (increased from 1000 for complex layouts)
                try {
                    // Strict monetary regex: Look for number with exactly 2 decimal places to avoid row numbers/section numbers
                    const regex = new RegExp(regexPattern + "[\\s\\S]{0,1500}?([\\d,]+\\.\\d{2})", 'i');
                    const match = text.match(regex);
                    if (match && match[1]) {
                        const val = parseFloat(match[1].replace(/,/g, ''));
                        // Accept 0.00 or legitimate values
                        if (!isNaN(val)) return val;
                    }
                } catch (e) {
                    console.error('Regex error for pattern:', regexPattern, e);
                }
            }
            return 0;
        };

        const extractString = (headers) => {
             for (const header of headers) {
                const regexPattern = flex(header);
                // Look for Header -> optional newline/space -> Capture Line
                try {
                    // Reverted to search for any content after header within range
                    // Look for: Header ... (newline) ... (Value)
                    // The [\\s\\S]{0,100} allows for address lines or spacing
                    const regex = new RegExp(regexPattern + "[\\s\\S]{0,100}?(?:\\r|\\n)+([\\w\\s,.-]+)", 'i');
                    const match = text.match(regex);
                    if (match && match[1]) {
                        let val = match[1].trim();
                        // Cleanup common garbage line numbers or dates if caught
                        if (val.length > 5 && !val.includes('Page')) return val; // Filter out page numbers
                    }
                } catch (e) {
                    console.error('Regex error for string pattern:', regexPattern, e);
                }
             }
             return 'Unknown Employer';
        };

        // 1. Gross Salary (17(1))
        const grossSalary = extractValue([ // Range 1500 handles this easily
            "Salary as per provisions contained in section 17\\(1\\)",
            "Gross Salary", 
            "Gross Total Income"
        ]);

        // 2. Exemptions u/s 10
        const exemptionsSection10 = extractValue([
            "Less: Allowances to the extent exempt under section 10",
            "Total amount of exemption claimed under section 10",
            "Section 10" 
        ]);

        // 3. Deductions u/s 16
        // Standard Deduction u/s 16(ia)
        const standardDeduction = extractValue([
            "Standard deduction under section 16\\(ia\\)",
            "Standard deduction u/s 16\\(ia\\)",
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
        let taxableSalary = extractValue([
            "Income chargeable under the head \"Salaries\"", // Most specific
            "Income chargeable under the head Salaries", 
            "Income chargeable under the head 'Salaries'",
            "Net Taxable Income"
        ]);

        // Logic Check: If Taxable Salary == Standard Deduction (common parsing error in this layout), recalculate
        // or if Taxable Salary is 0 but Gross is not.
        const calculatedTaxable = grossSalary - exemptionsSection10 - deductionsSection16;
        
        // Trust calculation if parsed value is suspicious (same as deduction, or 0 when gross is high)
        if ( (taxableSalary === standardDeduction && standardDeduction > 0) || (taxableSalary === 0 && grossSalary > 0) ) {
            console.log(`Note: Taxable Salary extracted (${taxableSalary}) suspicious. Using calculated: ${calculatedTaxable}`);
            taxableSalary = calculatedTaxable;
        }

        // 5. TDS
        const tdsDeducted = extractValue([
            "Total Tax Payable",
            "Net Tax Payable",
            "Total TDS",
            "Total tax deducted",
            "Tax Payable"
        ]);

        // 6. Employer Details
        console.log("Debug: Attempting Employer Extraction...");
        const employerName = extractString([
            "Name and address of the Employer", 
            "Name and address of the Deductor",
            "Employer Name"
        ]);
        console.log(`Debug: Employer Name result: "${employerName}"`);
        
        // TAN
        // TAN pattern is standard: 4 alpha, 5 numeric, 1 alpha. Look specifically near header if generic search fails
        let tan = "";
        const tanMatch = text.match(/TAN of the Deductor[\s\S]{0,100}?([A-Z]{4}\d{5}[A-Z])/i); 
        if (tanMatch) {
            tan = tanMatch[1];
            console.log("Debug: TAN found near header:", tan);
        } else {
             // Fallback to searching entire text
             const genericTan = text.match(/[A-Z]{4}\d{5}[A-Z]/);
             if (genericTan) {
                 tan = genericTan[0];
                 console.log("Debug: TAN found via generic search (fallback):", tan);
             } else {
                 console.log("Debug: TAN NOT FOUND");
             }
        }


        // Detect Form Type
        // Refined Part A: Must be explicit Certificate or Form 16 header. avoiding generic "TDS Deducted"
        const isPartA = /Form\s+No\.?\s*16|Certificate\s+under\s+section\s+203|Quarter-wise\s+break\s+up\s+of\s+TDS/i.test(text);
        
        // Refined Part B check: Use flex() for robust whitespace handling and add Annexure B
        const partBPatterns = [
            "Salary as per provisions",
            "Income chargeable under the head",
            "Annexure B",
            "Details of Salary Paid"
        ];
        // Test all patterns
        const isPartB = partBPatterns.some(p => {
             const pattern = flex(p);
             return new RegExp(pattern, 'i').test(text);
        });

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
