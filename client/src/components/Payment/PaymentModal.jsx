import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import useRazorpay from '../../hooks/useRazorpay';
import PricingPlans from './PricingPlans';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';
import { X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, itrId, onPaymentSuccess }) => {
    const { user } = useAuth();
    const { loadRazorpay } = useRazorpay();
    const [processing, setProcessing] = useState(null);

    if (!isOpen) return null;

    const handlePayment = async (plan) => {
        setProcessing(plan.id);
        const isLoaded = await loadRazorpay();

        if (!isLoaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            setProcessing(null);
            return;
        }

        try {
            // 1. Create Order
            const orderData = await paymentService.createOrder(plan.id, itrId);

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "TaxSaaS Platform",
                description: `Subscription for ${plan.name}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verification = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            itrId: itrId,
                            plan: plan.id
                        });

                        if (verification.status === 'success') {
                            alert('Payment Successful!');
                            onPaymentSuccess(plan.id);
                            onClose();
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (err) {
                        console.error('Verification Error', err);
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                    alert(response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error('Payment Error', error);
            alert('Failed to initiate payment');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-7xl m-4 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10">
                    <X size={24} />
                 </button>
                 <PricingPlans onSelect={handlePayment} processing={processing} />
            </div>
        </div>
    );
};

export default PaymentModal;
