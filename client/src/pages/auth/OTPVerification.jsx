import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Button from '../../components/Button/Button';
import { ShieldCheck } from 'lucide-react';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digit OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get mobile number from navigation state
    const mobile = location.state?.mobile;

    useEffect(() => {
        if (!mobile) {
            // navigate('/login'); // Redirect if no mobile present (commented for dev testing)
        }
        
        // Countdown timer
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [mobile, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;

        try {
            setLoading(true);
            setError('');
            await authService.verifyOTP(mobile, otpValue);
            // On success, redirect to dashboard or completion
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await authService.sendOTP(mobile);
            setTimer(30);
            setError('');
        } catch (err) {
            setError('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-blue-600" size={32} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Verify your Mobile
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        We sent a code to +91 {mobile}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                    <div className="flex justify-center gap-2">
                        {otp.map((data, index) => (
                            <input
                                className="w-12 h-12 border-2 rounded-lg text-center text-xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0 transition-colors outline-none"
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                inputMode="numeric"
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full justify-center"
                            isLoading={loading}
                            disabled={otp.some(digit => !digit)}
                        >
                            Verify OTP
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                            Didn't receive code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0}
                                className={`font-medium ${
                                    timer > 0 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-blue-600 hover:text-blue-500'
                                }`}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
