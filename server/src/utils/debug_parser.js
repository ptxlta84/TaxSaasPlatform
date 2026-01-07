const fs = require('fs');
const path = require('path');
const { parseForm16 } = require('./form16Parser');
const pdf = require('pdf-parse');

const debugForm16 = async (filename) => {
    const filePath = path.join(__dirname, '..', '..', filename);
    
    console.log(`\n--- Debugging File: ${filePath} ---`);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        
        // 1. Run the actual parser
        console.log("Running parseForm16()...");
        const result = await parseForm16(dataBuffer);
        console.log("\n--- Parsed Result Object ---");
        console.log(JSON.stringify(result, null, 2));

        // 2. Dump Raw Text for inspection
        console.log("\n\n--- RAW PDF TEXT DUMP (First 2000 chars) ---");
        const rawData = await pdf(dataBuffer);
        // Search for specific keywords and print context
        const keywords = ["Standard deduction", "Income chargeable", "Net Taxable Income"];
        console.log("\n--- KEYWORD CONTEXT ---");
        keywords.forEach(kw => {
            const idx = rawData.text.indexOf(kw);
            if (idx !== -1) {
                console.log(`\nFound '${kw}' at index ${idx}:`);
                console.log(rawData.text.substring(idx, idx + 500).replace(/\n/g, '\\n'));
            } else {
                console.log(`\n'${kw}' NOT FOUND`);
            }
        });

    } catch (err) {
        console.error("Debug Error:", err);
    }
};

const fileName = process.argv[2] || 'form16.pdf';
debugForm16(fileName);
