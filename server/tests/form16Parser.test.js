const parser = require('../src/utils/form16Parser');
const { } = require('../src/utils/taxCalculator');

// Mock Data representing extracted text from a PDF
const MOCK_PDF_TEXT_PART_A = `
FORM NO. 16
[See rule 31(1)(a)]
PART A
Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary
Name and address of the Employer
MOCK CORP SOLUTIONS PVT LTD
Electronic City, Bangalore - 560100
PAN of the Deductor
BLRM12345F
TAN of the Deductor
BLRM12345T
Assessment Year
2025-26
Period with the Employer
From 01-Apr-2024 to 31-Mar-2025
Details of Tax Deducted and Deposited
Quarter(s)    Receipt Numbers    Amount Paid/Credited    Amount of tax deducted    Amount of tax deposited
Q1            REC001             2,50,000                25,000                    25,000
Q2            REC002             2,50,000                25,000                    25,000
Q3            REC003             2,50,000                25,000                    25,000
Q4            REC004             2,50,000                25,000                    25,000
Total Paid: 10,00,000            Total TDS: 1,00,000     Total Deposited: 1,00,000
`;

const MOCK_PDF_TEXT_PART_B = `
PART B (Annexure)
Details of Salary Paid and any other income and tax deducted
1. Gross Salary
   (a) Salary as per provisions contained in sec. 17(1)    12,00,000
   (b) Value of perquisites u/s 17(2)                      0
   (c) Profits in lieu of salary u/s 17(3)                 0
   Total                                                   12,00,000
2. Less: Allowances to the extent exempt u/s 10
   (a) House Rent Allowance                                2,00,000
3. Balance (1-2)                                           10,00,000
4. Deductions:
   (a) Standard Deduction u/s 16(ia)                       50,000
   (b) Professional Tax                                    2,400
5. Aggregate of 4(a) to 4(c)                               52,400
6. Income chargeable under the head 'Salaries' (3-5)       9,47,600
10. Deductions under Chapter VI-A
    (a) 80C                                                1,50,000
    (b) 80D                                                25,000
`;

// Mock the pdf-parse library
jest.mock('pdf-parse', () => {
    return jest.fn((buffer) => Promise.resolve({
        text: buffer.toString().includes('PART B') ? MOCK_PDF_TEXT_PART_B : MOCK_PDF_TEXT_PART_A,
        info: {},
        metadata: {},
        version: '1.0'
    }));
});

describe('Form-16 Parser Regression Tests', () => {
    
    it('correctly identifies Part A and extracts Employer Info', async () => {
        const mockBuffer = Buffer.from('mock pdf content part a');
        const result = await parser.parseForm16(mockBuffer);

        expect(result.isPartA).toBe(true);
        expect(result.isPartB).toBe(false);
        expect(result.employer.name).toBe('MOCK CORP SOLUTIONS PVT LTD');
        expect(result.employer.tan).toBe('BLRM12345T');
        expect(result.tdsDeducted).toBe(100000);
        
        // Snapshot to ensure format stability
        expect(result).toMatchSnapshot();
    });

    it('correctly identifies Part B and extracts Salary Info', async () => {
        // Trigger Part B text by sending a buffer that "includes" the trigger word in our mock implementation
        const mockBuffer = Buffer.from('mock pdf content PART B');
        const result = await parser.parseForm16(mockBuffer);

        expect(result.isPartB).toBe(true);
        expect(result.grossSalary).toBe(1200000);
        expect(result.standardDeduction).toBe(50000);
        expect(result.taxableSalary).toBe(947600);
        
        // Snapshot to ensure extracted numbers don't regress
        expect(result).toMatchSnapshot();
    });
});
