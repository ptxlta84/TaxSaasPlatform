import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Button/Button';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-90 pattern-grid-lg"></div>
        <div className="relative z-10 text-white text-center px-12">
            <div className="flex justify-center mb-6">
                 <ShieldCheck size={64} className="text-blue-200" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Secure Tax Filing for Modern India</h2>
            <p className="text-lg text-blue-100">Join 5 Million+ taxpayers who trust TaxSaas for accurate, automated, and secure filing.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
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
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  error={errors.email}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  error={errors.password}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full justify-center"
                  >
                    Sign in
                  </Button>
                  
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/auth/register/client" className="text-blue-600 hover:underline font-medium">
                          Sign up as client
                        </Link>
                      </p>
                    </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
