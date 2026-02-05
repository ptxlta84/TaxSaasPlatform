import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import Button from '../../Button/Button';
import { useAuth } from '../../../contexts/AuthContext';
// import { paymentService } from '../../../services/paymentService'; // Existing service needing update? 
// No, existing service just calls API. We can reuse or extend.
import api from '../../../services/authService'; // Direct API for custom endpoints if needed

const UnifiedPaymentModal = ({ isOpen, onClose, amount, purpose = 'General Payment', onSuccess = () => {} }) => {
    const { user: userDetails } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;
    
    // Calculate GST if it's a Service Fee (Platform fee)
    // Assumption: If purpose is 'Tax Payment', no GST on the tax itself.
    const isTaxPayment = purpose.toLowerCase().includes('tax payment') || purpose.toLowerCase().includes('challan');
    
    const gstRate = isTaxPayment ? 0 : 0.18;
    const gstAmount = amount * gstRate;
    const totalPayable = amount + gstAmount;

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: order } = await api.post('/payments/create-order', {
                amount: totalPayable,
                paymentType: isTaxPayment ? 'TAX_PAYMENT' : 'SERVICE_FEE',
                notes: { purpose, customerName: userDetails.name }
            });

            // 2. Open Razorpay
            const options = {
                key: "rzp_test_1234567890", // Replace with env var in real integration
                amount: order.amount,
                currency: order.currency,
                name: "TaxSaas Platform",
                description: `${purpose} ${isTaxPayment ? '' : '+ GST'}`,
                image: "https://via.placeholder.com/150", 
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingData: { // Generic meta data container
                                purpose,
                                amount: totalPayable,
                                date: new Date().toISOString()
                            }
                        });
                        
                        onSuccess({
                            paymentId: response.razorpay_payment_id,
                            amount: totalPayable
                        });
                    } catch (verifyErr) {
                        alert("Payment Verification Failed");
                        console.error(verifyErr);
                    }
                },
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.mobile
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
            onClose(); // Close our modal, let Razorpay handle the rest

        } catch (error) {
            console.error("Payment Start Error:", error);
            alert("Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-blue-600" size={24}/> 
                        Secure Payment
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg flex items-start gap-3">
                        <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={18}/>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-semibold block mb-1">Your payment is encrypted</span>
                            We use bank-grade 256-bit SSL encryption. TaxSaas does not store your card details.
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>{purpose}</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                        {!isTaxPayment && (
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>GST (18%)</span>
                                <span>₹{gstAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                            <span>Total Payable</span>
                            <span>₹{totalPayable.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="pt-4 space-y-3">
                         <div className="flex items-center gap-4 py-2 opacity-70 justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4" />
                        </div>
                        
                        <Button className="w-full h-12 text-lg" onClick={handlePayment} disabled={loading}>
                            {loading ? 'Processing...' : `Pay ₹${totalPayable.toFixed(2)}`}
                        </Button>
                        
                        <p className="text-xs text-center text-gray-400">
                             By clicking Button, you agree to our Terms & Conditions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedPaymentModal;
