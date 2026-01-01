const mongoose = require('mongoose');

const gstInvoiceSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    customerName: { type: String, required: true },
    customerGSTIN: { type: String }, // Optional
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    items: [{
        description: String,
        hsnCode: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        gstRate: { type: Number, required: true }, // e.g., 18 for 18%
        amount: Number // Computed
    }],
    subTotal: { type: Number, required: true },
    taxType: { 
        type: String, 
        enum: ['intra', 'inter'], // Intra-state (CGST+SGST) or Inter-state (IGST)
        default: 'intra' 
    },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'issued', 'paid'],
        default: 'draft'
    }
}, {
    timestamps: true
});

const GSTInvoice = mongoose.model('GSTInvoice', gstInvoiceSchema);
module.exports = GSTInvoice;
