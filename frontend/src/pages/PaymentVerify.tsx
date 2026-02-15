import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reference = searchParams.get('reference');
  const demo = searchParams.get('demo');

  const verifyMutation = useMutation(
    async () => {
      const response = await api.post('/payments/verify', { reference });
      return response.data.data;
    },
    {
      onSuccess: () => {
        toast.success('Payment verified! Your ticket has been issued.');
        // Invalidate tickets cache to ensure new ticket appears on dashboard
        queryClient.invalidateQueries('myTickets');
        setTimeout(() => {
          // Redirect to dashboard with success indicator
          navigate('/dashboard?paymentSuccess=true');
        }, 1500);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Verification failed');
        setTimeout(() => {
          navigate('/my-tickets');
        }, 2000);
      },
    }
  );

  useEffect(() => {
    if (reference) {
      verifyMutation.mutate();
    } else if (demo === 'true') {
      // Handle demo payment (no Paystack verification needed)
      toast.success('Payment verified! Your ticket has been issued.');
      queryClient.invalidateQueries('myTickets');
      setTimeout(() => {
        navigate('/dashboard?paymentSuccess=true');
      }, 1500);
    } else {
      toast.error('No payment reference found');
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, demo]);

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Verifying Payment"
          subtitle="Hang tight while we confirm your transaction."
          badge="Payments"
        />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Verifying Payment...</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentVerify;
