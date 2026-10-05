import { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Crown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PLAN_DETAILS = {
  pro: {
    name: 'Pro Plan',
    price: '₹499',
    period: '/ month',
    badge: 'Most Popular',
    color: '#7c3aed',
    features: [
      'Unlimited eBooks & Chapters',
      'Unlimited AI Generations',
      'Full AI Suite (Outline, Rewrite, Expand, Summarize)',
      'Export to DOCX & PDF',
      'Advanced Analytics & Favorites',
      'Priority Support',
    ],
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: '₹1,499',
    period: '/ month',
    badge: 'Ultimate Power',
    color: '#d97706',
    features: [
      'Everything in Pro Plan',
      'Team Workspace & Collaboration',
      'Role-based access (Admin/Editor)',
      'Shared Books & Organization',
      'Dedicated Support',
      '99.9% Uptime Guarantee',
    ],
  },
};

// Script loader helper for Razorpay SDK
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentModal = ({ planId, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const planKey = (planId || 'pro').toLowerCase();
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.pro;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // 1. Create Payment Order on backend (Server is source of truth for pricing)
      const { data: orderData } = await api.post('/payments/create-order', {
        planId: planKey,
      });

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const isRazorpayLoaded = await loadRazorpayScript();
      const isSimulated = orderData.order?.isSimulated || orderData.keyId === 'rzp_test_simulated';

      if (isRazorpayLoaded && window.Razorpay && !isSimulated) {
        // Standard Production / Test Mode Razorpay Checkout Popup
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'AI eBook Creator',
          description: `${plan.name} Subscription`,
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const { data } = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: planKey,
              });

              if (data.success) {
                updateUser(
                  data.user || {
                    subscriptionPlan: planKey.toUpperCase(),
                    plan: planKey,
                    subscriptionStatus: 'active',
                  }
                );
                setCompleted(true);
                toast.success(`🎉 Successfully upgraded to ${plan.name}!`);
                setTimeout(() => {
                  if (onSuccess) onSuccess(planKey);
                  onClose();
                }, 1200);
              }
            } catch (verifyErr) {
              toast.error(
                verifyErr.response?.data?.message || 'Payment verification failed'
              );
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#7c3aed',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        // Test environment simulation flow (verified on server)
        const orderId = orderData.order?.id || `order_sim_${Date.now()}`;
        const paymentId = `pay_test_${Date.now()}`;
        const signature = `sim_sig_${Date.now()}`;

        const { data } = await api.post('/payments/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          planId: planKey,
        });

        if (data.success) {
          updateUser(
            data.user || {
              subscriptionPlan: planKey.toUpperCase(),
              plan: planKey,
              subscriptionStatus: 'active',
            }
          );
          setCompleted(true);
          toast.success(`🎉 Successfully upgraded to ${plan.name}!`);
          setTimeout(() => {
            if (onSuccess) onSuccess(planKey);
            onClose();
          }, 1200);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-card border border-border dark:border-border rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                Upgrade Subscription
              </h2>
              <p className="text-xs text-text-secondary">Razorpay Secure Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {completed ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-sm text-text-secondary max-w-xs">
              You are now on the{' '}
              <span className="font-semibold text-primary">{plan.name}</span>. All
              features have been unlocked!
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Selected Plan Summary Banner */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-white">
                  {plan.badge}
                </span>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mt-1">
                  {plan.name}
                </h4>
                <p className="text-xs text-text-secondary">
                  Full access to all {planKey.toUpperCase()} features
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-primary">
                  {plan.price}
                </span>
                <span className="text-xs text-text-secondary">{plan.period}</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                What's included in your plan:
              </p>
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <hr className="border-border" />

            {/* Pay Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay {plan.price} & Activate {plan.name}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-text-secondary flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Test Mode / Production HMAC Verified</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
