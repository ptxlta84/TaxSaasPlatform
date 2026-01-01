const PDFDocument = require('pdfkit');

exports.generateITRPdf = (itr, res) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(res);

    // --- COVER PAGE ---
    doc.fontSize(25).text('Income Tax Return Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Assessment Year: ${itr.financialYear}`, { align: 'center' });
    doc.text(`Generated on: ${new Date().toDateString()}`, { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(16).text('Taxpayer Details');
    doc.fontSize(12).text(`Name: ${itr.user.name || 'N/A'}`);
    doc.text(`Email: ${itr.user.email}`);
    doc.text(`Ack Number: ${itr.acknowledgementNumber || 'Draft'}`);
    doc.text(`Filing Status: ${itr.status.toUpperCase()}`);

    doc.moveDown(2);
    doc.save(); // Save state

    // --- SUMMARY TABLE ---
    doc.rect(50, doc.y, 500, 140).stroke();
    doc.fontSize(14).text('Tax Liability Summary', 60, doc.y + 10);
    doc.moveDown(0.5);

    const startY = doc.y;
    const col1 = 60;
    const col2 = 300;

    doc.fontSize(12);
    doc.text('Total Income:', col1, startY + 20);
    doc.text(`INR ${itr.computation.taxableIncome.toLocaleString()}`, col2, startY + 20);

    doc.text('Total Tax Payable:', col1, startY + 40);
    doc.text(`INR ${itr.computation.totalTaxLiability.toLocaleString()}`, col2, startY + 40);

    doc.text('Taxes Paid (TDS):', col1, startY + 60);
    doc.text(`INR ${(itr.computation.tdsCredit || 0).toLocaleString()}`, col2, startY + 60);

    doc.fontSize(14).fillColor(itr.computation.refundDue > 0 ? 'green' : 'red');
    doc.text(itr.computation.refundDue > 0 ? 'Refund Due:' : 'Net Payable:', col1, startY + 90);
    doc.text(`INR ${(itr.computation.refundDue > 0 ? itr.computation.refundDue : itr.computation.amountPayable).toLocaleString()}`, col2, startY + 90);
    
    doc.fillColor('black'); // Reset color
    doc.addPage();

    // --- INCOME DETAILS ---
    doc.fontSize(16).text('Income Details');
    doc.moveDown();
    doc.fontSize(12);
    doc.list([
        `Salary (Net): INR ${(itr.income.salary.net || 0).toLocaleString()}`,
        `House Property: INR ${(itr.income.houseProperty || 0).toLocaleString()}`,
        `Other Sources: INR ${(itr.income.otherSources || 0).toLocaleString()}`,
        `Business/Profession: INR ${(itr.income.business || 0).toLocaleString()}`,
        `Capital Gains: INR ${(itr.income.capitalGains || 0).toLocaleString()}`
    ]);

    doc.moveDown();

    // --- DEDUCTIONS ---
    doc.fontSize(16).text('Deductions Claimed');
    doc.moveDown();
    doc.fontSize(12);
    
    const deductionItems = [];
    if (itr.deductions.section80C) deductionItems.push(`Section 80C: INR ${itr.deductions.section80C.toLocaleString()}`);
    if (itr.deductions.section80D) deductionItems.push(`Section 80D: INR ${itr.deductions.section80D.toLocaleString()}`);
    if (itr.deductions.hra) deductionItems.push(`HRA Exemption: INR ${itr.deductions.hra.toLocaleString()}`);
    
    if (deductionItems.length > 0) {
        doc.list(deductionItems);
    } else {
        doc.text('No deductions claimed.');
    }

    doc.moveDown();

    // --- PROOF CHECKLIST ---
    doc.rect(50, doc.y, 500, 150).fillAndStroke('#f0f9ff', '#000');
    doc.fillColor('black').fontSize(14).text('Document Proof Checklist', 60, doc.y - 140);
    doc.fontSize(10);
    doc.moveDown(0.5);
    doc.text('Please verify you have the following documents ready for audit:', 60);
    doc.moveDown();
    
    if (itr.deductions.section80C) doc.text('[ ] LIC Premium Receipts / PPF Passbook', 70);
    if (itr.deductions.section80D) doc.text('[ ] Health Insurance Premium Receipt', 70);
    if (itr.deductions.hra) doc.text('[ ] Rent Receipts & PAN of Landlord', 70);
    doc.text('[ ] Form 16 from Employer', 70);
    doc.text('[ ] Bank Statements (Interest Income)', 70);

    doc.end();
};
