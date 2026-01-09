
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
                
                try {
                    // CRITICAL FIX: Use global flag 'g' and loop to find VALID match
                    // We look for the pattern ONCE, then scan for numbers AFTER it using a separate technique
                    // OR: Use a single regex with 'g' is tricky because the lookahead is variable.
                    // BETTER: Find the header index, then scan the substring after it.
                    
                    const headerRegex = new RegExp(regexPattern, 'i');
                    const headerMatch = text.match(headerRegex);

                    if (!headerMatch) continue;

                    // Start searching from end of header
                    const searchStartPayload = text.substring(headerMatch.index + headerMatch[0].length);
                    
                    // Look for numbers in the next 2000 chars
                    const chunk = searchStartPayload.substring(0, 2000);
                    
                    // Find ALL number candidates in this chunk
                    const numberRegex = /(\d{1,3}(?:,\d{2,3})*(?:.\d{1,2})?)/g;
                    let numMatch;
                    
                    while ((numMatch = numberRegex.exec(chunk)) !== null) {
                        const raw = numMatch[1].replace(/,/g, '');
                        const val = parseFloat(raw);

                        // Strict filter: Ignore values that match specific Section Numbers
                        if ([1, 2, 3, 4, 5, 7, 10, 16, 17, 192].includes(val)) {
                             // console.log(`Debug: Ignored Section Number/Index: ${val}`);
                             continue;
                        }

                        // Heuristic: For Major Salary heads, value should be substantial (>100)
                        if (val < 100 && val !== 0) {
                             // console.log(`Debug: Ignored suspicious small value: ${val}`);
                             continue;
                        }
                        
                        if (!isNaN(val)) return val; // First valid number found
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
            "Total Gross Salary",
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
        
        // Strategy: Look for "Name and address of the Employer" then capture subsequent lines
        let employerName = "Unknown Employer";
        let employerAddress = "Address not found";
        
        try {
             // Find the header index
             const headerRegex = /Name\s+and\s+address\s+of\s+(?:the\s+)?(?:Employer|Deductor)/i;
             const headerMatch = text.match(headerRegex);
             
             if (headerMatch) {
                 // capture next 200 chars
                 const start = headerMatch.index + headerMatch[0].length;
                 const chunk = text.substring(start, start + 300);
                 
                 // Split by newlines (assuming PDF text extraction preserves roughly line breaks or groupings)
                 // Clean up chunk: remove multiple spaces/newlines
                 const lines = chunk.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2 && !l.includes('PAN') && !l.includes('TAN'));
                 
                 if (lines.length > 0) {
                     employerName = lines[0]; // First line is usually name
                     if (lines.length > 1) {
                         employerAddress = lines.slice(1, 4).join(', '); // Next few lines are address
                     }
                 }
             }
        } catch (e) {
            console.error("Employer Extraction Error:", e);
        }

        // Fallback for Name if above failed specific regex
        if (employerName === "Unknown Employer") {
             employerName = extractString([
                "Name and address of the Employer", 
                "Name and address of the Deductor",
                "Employer Name"
            ]);
        }

        console.log(`Debug: Employer Name: "${employerName}", Address: "${employerAddress}"`);
        
        // 7. Income from Other Sources & House Property (New Requirement)
        const incomeOtherSources = extractValue([ // often 192 (2B)
            "Income under the head Other Sources",
            "Any other income reported by the employee"
        ]);
        
        const incomeHouseProperty = extractValue([
            "Income \\(or admissible loss\\) from house property", // Escaped parens for regex
            "Income from house property"
        ]);

        // TAN
        // TAN pattern is standard: 4 alpha, 5 numeric, 1 alpha. Look specifically near header if generic search fails
        let tan = "";
        const tanMatch = text.match(/TAN\s+(?:of\s+the\s+Deductor)?[\s\S]{0,100}?([A-Z]{4}\d{5}[A-Z])/i); 
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



        // --- STRICT CLASSIFICATION STRATEGY ---
        
        // Part A Signals (ALL required)
        // 1. "Certificate under section 203"
        // 2. "Form No. 16"
        // 3. "Details of Tax Deducted" (allowing flexibility)
        const hasCert203 = /Certificate\s+under\s+section\s+203/i.test(text);
        const hasForm16 = /Form\s+No\.?\s*16/i.test(text);
        
        // "Details of Tax Deducted and Deposited" - specific to Part A
        const hasTaxDetails = /Details\s+of\s+Tax\s+Deducted/i.test(text);

        // Part B Signals (ANY required)
        const partBPatterns = [
            "Salary as per provisions", // of section 17
            "Less: Allowance",
            "Gross Salary", // Be careful, Part A might sum this, but usually "Amount Paid"
            "Deductions under Chapter VI-A"
        ];
        
        const matchedPartBTokens = [];
        let isPartB = false;
        
        for (const p of partBPatterns) {
             if (new RegExp(flex(p), 'i').test(text)) {
                 isPartB = true;
                 matchedPartBTokens.push(p);
                 // Don't break, capture all for logging confidence
             }
        }

        // Logic Implementation
        // Part A is ONLY true if ALL strong signals match AND it is NOT Part B (via late exclusion)
        let isPartA = hasCert203 && hasForm16 && hasTaxDetails;

        // EXCLUSION RULE REMOVED: Allow both to be true for Combined PDFs
        // if (isPartB) {
        //    isPartA = false; 
        // }

        const resolvedAs = isPartB ? "B" : (isPartA ? "A" : "UNKNOWN");
        
        // MANDATORY LOGGING
        const classificationLog = {
            isPartA_initial: hasCert203 && hasForm16 && hasTaxDetails,
            isPartB,
            signals: {
                hasCert203,
                hasForm16,
                hasTaxDetails,
                partB_matches: matchedPartBTokens
            },
            resolvedAs,
            matchedTokens: matchedPartBTokens
        };
        console.log("FORM16_CLASSIFICATION:", JSON.stringify(classificationLog, null, 2));

        const result = {
            isPartA, // Final resolving boolean
            isPartB, // Final resolving boolean
            matchReason: matchedPartBTokens.length > 0 ? `Part B (Tokens: ${matchedPartBTokens.join(', ')})` : (isPartA ? "Part A (Strict Signal Match)" : "Unknown"),
            employer: {
                name: employerName !== 'Unknown Employer' ? employerName : "Employer (Name not found)",
                tan: tan,
                address: employerAddress !== 'Address not found' ? employerAddress : "" 
            },
            grossSalary,
            exemptionsSection10,
            deductionsSection16,
            standardDeduction,
            professionalTax,
            taxableSalary, 
            tdsDeducted,
            // New Fields for House Property and Other Sources
            incomeOtherSources,
            incomeHouseProperty,
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
