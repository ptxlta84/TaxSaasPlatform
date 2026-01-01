import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Button/Button';
import { ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth(); // rename to avoid conflict with hook-form's register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      // Default to 'user' role for now. backend supports 'admin', 'user'
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900 opacity-90 pattern-grid-lg"></div>
        <div className="relative z-10 text-white text-center px-12">
            <div className="flex justify-center mb-6">
                 <ShieldCheck size={64} className="text-indigo-200" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Start Your Tax Savings Journey</h2>
            <p className="text-lg text-indigo-100">Create an account to access AI-powered tax planning, automated filing, and expert support.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  error={errors.name}
                />

                <FormInput
                  label="Email address"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  error={errors.email}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="******"
                  {...register('password')}
                  error={errors.password}
                />

                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="******"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword}
                />

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Account
                  </Button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
