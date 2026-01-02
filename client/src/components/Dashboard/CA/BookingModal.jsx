import React, { useState } from 'react';
import { X, Calendar, Clock, CreditCard, ChevronRight, CheckCircle, Video } from 'lucide-react';
import Button from '../../Button/Button';
import { bookingService } from '../../../services/bookingService';
import { paymentService } from '../../../services/paymentService';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [type, setType] = useState('quick_review');
  const [duration, setDuration] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  if (!isOpen || !ca) return null;

  // Pricing Logic
  const pricing = {
      quick_review: { base: 499, per30min: 499 },
      full_filing: { base: 1999, per30min: 1000 },
      ca_managed: { base: 4999, per30min: 2000 }
  };

  const calculatePrice = () => {
      const p = pricing[type];
      const multipliers = duration / 30;
      return p.base * multipliers; // Simplified logic as per request hint
  };

  const totalPrice = calculatePrice();

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBook = async () => {
    setLoading(true);
    try {
        if (paymentMethod === 'UPI' || paymentMethod === 'Credit Card' || paymentMethod === 'Net Banking') {
             // 1. Load Script
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 2. Create Order on Server
            const orderData = await paymentService.createOrder(Math.round(totalPrice * 1.18)); // With GST

            // 3. Open Razorpay
            const options = {
                key: "rzp_test_1234567890", // Replace with key from env in production
                amount: orderData.amount,
                currency: orderData.currency,
                name: "TaxSaas Platform",
                description: `Consultation with ${ca.name}`,
                image: "https://your-logo-url.com/logo.png",
                order_id: orderData.id,
                handler: async function (response) {
                    setLoading(true); // Show loading while verifying
                    // 4. Verify Payment on Server
                    try {
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingData: {
                                caId: ca.id,
                                caName: ca.name,
                                consultationType: type,
                                date: date,
                                timeSlot: timeSlot,
                                duration,
                                amount: totalPrice
                            }
                        });
                        setStep(3); // Start Success Screen
                    } catch (err) {
                        alert("Payment Verification Failed");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: "User Name", // Ideally from AuthContext
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response){
                    alert(response.error.description);
            });
            rzp1.open();
        } else {
             // Mock or Offline path if needed
             alert("Only Online Payment Supported via Razorpay");
        }
    } catch (err) {
        console.error(err);
        alert("Booking Initiation Failed");
    } finally {
        setLoading(false);
    }
  };

  // Date Generator (Next 7 Days)
  const availableDates = Array.from({length: 5}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return {
          label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          value: d.toISOString().split('T')[0]
      };
  });

  const timeSlots = ["10:00 - 10:30", "11:00 - 11:30", "14:00 - 14:30", "16:00 - 16:30"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">
                {step === 3 ? 'Booking Confirmed' : `Book ${ca.name}`}
            </h3>
            <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Body */}
        <div className="p-6">
            {step === 1 && (
                <div className="space-y-6">
                    {/* Consultation Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Consultation Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(pricing).map(k => (
                                <button 
                                    key={k}
                                    onClick={() => setType(k)}
                                    className={`p-2 text-xs rounded-lg border text-center capitalize
                                        ${type === k ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:border-blue-200 dark:border-gray-600'}`}
                                >
                                    {k.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-medium text-gray-500 mb-2 block">Select Date</label>
                             <div className="space-y-2 max-h-40 overflow-y-auto">
                                 {availableDates.map(d => (
                                     <button 
                                        key={d.value}
                                        onClick={() => setDate(d.value)}
                                        className={`w-full text-left p-2 rounded text-sm ${date === d.value ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`} 
                                     >
                                        <Calendar size={14} className="inline mr-2"/> {d.label}
                                     </button>
                                 ))}
                             </div>
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-500 mb-2 block">Available Slots</label>
                             <div className="grid grid-cols-1 gap-2">
                                 {timeSlots.map(t => (
                                     <button 
                                        key={t}
                                        onClick={() => setTimeSlot(t)}
                                        className={`p-2 rounded text-xs text-center border ${timeSlot === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 dark:border-gray-600'}`}
                                     >
                                         <Clock size={12} className="inline mr-1"/> {t}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400">Estimated Cost</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{totalPrice}</p>
                        </div>
                        <Button onClick={() => setStep(2)} disabled={!date || !timeSlot}>
                            Proceed to Pay <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-xl">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Consultation Fee</span>
                            <span className="font-medium">₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">GST (18%)</span>
                            <span className="font-medium">₹{(totalPrice * 0.18).toFixed(0)}</span>
                        </div>
                         <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                            <span>Total Payable</span>
                            <span>₹{(totalPrice * 1.18).toFixed(0)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-3 block">Payment Method</label>
                        <div className="space-y-3">
                            {['UPI', 'Credit Card', 'Net Banking'].map(m => (
                                <div key={m} onClick={() => setPaymentMethod(m)} className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer ${paymentMethod === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === m ? 'border-4 border-blue-500' : 'border-gray-300'}`}></div>
                                    <span className="text-sm font-medium">{m}</span>
                                    {m === 'UPI' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-auto">Fastest</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className="pt-4 flex justify-between items-center">
                        <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:underline">Back</button>
                        <Button onClick={handleBook} isLoading={loading}>
                            Pay & Confirm Booking
                        </Button>
                    </div>
                </div>
            )}

             {step === 3 && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500 mb-6">You will receive a meeting link via WhatsApp and Email shortly.</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-center gap-2 mb-6 text-blue-700 dark:text-blue-300">
                        <Video size={18} />
                        <span className="font-medium">Meeting Link Generated</span>
                    </div>

                    <Button onClick={onClose} className="w-full">
                        Done
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
