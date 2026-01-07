const pdf = require('pdf-parse');

const parseForm16 = async (buffer) => {
    try {
        const data = await pdf(buffer);
        const text = data.text;

        // --- Regex Patterns (Enhanced for LIC/TRACES) ---

        // Helper to find value after a pattern (flexible for whitespace/newlines)
        // Looks for the pattern, then optionally some non-digit chars, then captures the number
        const extractValue = (patterns) => {
            for (const pattern of patterns) {
                // Regex: Pattern -> flexible space/chars -> capture number (with commas/decimals)
                // Flags: i (case insensitive), g (global - though we usually want first match)
                const regex = new RegExp(`${pattern}[\\s\\S]{0,150}?([\\d,]+\\.?\\d*)`, 'i');
                const match = text.match(regex);
                if (match && match[1]) {
                    // Check if the match is a valid number-like string (e.g. not a year like 2024-25 if context implies currency)
                    const val = parseFloat(match[1].replace(/,/g, ''));
                    // Filter out small numbers that might be serial numbers (like "1.", "2.") unless expected
                    if (!isNaN(val)) return val;
                }
            }
            return 0;
        };

        const extractString = (startPattern, endPattern) => {
            const regex = new RegExp(`${startPattern}([\\s\\S]*?)${endPattern}`, 'i');
            const match = text.match(regex);
            if (match && match[1]) {
                return match[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            }
            return '';
        };

        // 1. Gross Salary
        // Target: "Salary as per provisions contained in section 17(1)", "Gross Salary"
        const grossSalary = extractValue([
            "Salary as per provisions contained in section 17\\(1\\)",
            "Gross Salary", 
            "Gross Total Income"
        ]);

        // 2. Exemptions u/s 10
        const exemptionsSection10 = extractValue([
            "Less: Allowance to the extent exempt u/s 10",
            "Total amount of exemption claimed under section 10",
            "Section 10" // fallback
        ]);

        // 3. Deductions u/s 16
        // Standard Deduction u/s 16(ia)
        const standardDeduction = extractValue([
            "Standard deduction under section 16\\(ia\\)",
            "Standard deduction u/s 16"
        ]);
        
        // Professional Tax u/s 16(iii)
        const professionalTax = extractValue([
            "Tax on employment",
            "Professional Tax",
            "entertainment allowance" // unlikely for non-govt but part of sec 16
        ]);

        const deductionsSection16 = standardDeduction + professionalTax;

        // 4. Taxable Salary
        const taxableSalary = extractValue([
            "Income chargeable under the head \"Salaries\"",
            "Income chargeable under the head 'Salaries'",
            "Net Taxable Income"
        ]);

        // 5. TDS
        const tdsDeducted = extractValue([
            "Total Tax Payable",
            "Tax Deducted at Source", 
            "Total TDS"
        ]);

        // 6. Employer Details
        // TRACES usually has "Name and address of the Employer" then the address box.
        // We'll try to grab lines following key text.
        // This is tricky in PDF text dump as layout is lost.
        // Strategy: Look for specific label -> capture up to PAN/TAN label
        const employerNameRaw = extractString("Name and address of the Employer", "Name and address of the Employee");
        // Clean up common noise if necessary, or just use as is. 
        // Often PDF parse merges lines, so we might get "Name... \n LIC OF INDIA \n ... PAN..."
        
        // Simpler approach for generic fields matching specific headers
        const employerNameMatch = text.match(/(?:Name and address of the Employer|Name and address of the Deductor)[\s\S]{0,10}?[\r\n]+([^\r\n]+)/i);
        const employerName = employerNameMatch ? employerNameMatch[1].trim() : "Employer";
        
        // TAN
        const tanMatch = text.match(/(?:TAN of the Deductor|TAN of the Employer)[\s\S]{0,50}?([A-Z]{4}\d{5}[A-Z])/i);
        const tan = tanMatch ? tanMatch[1] : "";


        // Detect Form Type
        // Part A usually contains TDS certificate info
        const isPartA = /Certificate under section 203|Quarter-wise break up of TDS|TDS Deducted at Source/i.test(text);
        
        // Part B usually contains "Income chargeable under the head 'Salaries'" or detailed breakup
        const isPartB = /(?:Salary as per provisions contained in section 17\(1\)|Income chargeable under the head "Salaries")/i.test(text);

        const result = {
            isPartA,
            isPartB,
            employer: {
                name: employerName,
                tan: tan,
                address: "" // Address extraction is unreliable in unstructured text
            },
            grossSalary,
            exemptionsSection10,
            deductionsSection16,
            standardDeduction,
            professionalTax,
            taxableSalary, // Explicit field
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
