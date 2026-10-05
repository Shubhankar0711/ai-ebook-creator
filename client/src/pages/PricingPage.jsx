import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Sparkles, Building2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PaymentModal from '../components/ui/PaymentModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const PLAN_META = {
  free: {
    icon: Zap,
    color: '#6b7280',
    features: ['5 eBooks max', '10 AI generations / day', 'PDF export', 'Basic editor', 'Community support'],
    highlight: false,
  },
  pro: {
    icon: Sparkles,
    badge: 'Most Popular',
    color: '#7c3aed',
    features: [
      'Unlimited eBooks',
      'Unlimited AI generations',
      'Full AI suite (Outline, Rewrite, Expand, Summarize)',
      'Analytics dashboard',
      'Priority support',
      'Share links',
      'Export to DOCX & PDF',
    ],
    highlight: true,
  },
  enterprise: {
    icon: Building2,
    color: '#d97706',
    features: [
      'Everything in Pro',
      'Team workspace',
      'API access',
      'Role-based management',
      'Dedicated support',
      'SLA guarantee',
    ],
    highlight: false,
  },
};

const PricingPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
  const [paying, setPaying] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentPlan = (user?.subscriptionPlan || user?.plan || 'free').toLowerCase();

  useEffect(() => {
    api
      .get('/payments/plans')
      .then(({ data }) => {
        setPlans(data.plans || []);
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (planId === currentPlan || planId === 'free') return;
    setSelectedPaymentPlan(planId);
  };

  const handleCancelPlan = async () => {
    setPaying('cancel');
    try {
      await api.post('/payments/cancel');
      updateUser({ plan: 'free', subscriptionPlan: 'FREE', subscriptionStatus: 'cancelled' });
      toast.success('Plan cancelled. You are now on Free plan.');
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel plan');
    } finally {
      setPaying(null);
    }
  };

  // Build display plans: always show free + server plans
  const displayPlans = [
    { id: 'free', name: 'Free', amount: 0, currency: 'INR' },
    ...plans.filter((p) => p.id !== 'free'),
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <Crown className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </span>
          <h1
            className="text-3xl font-extrabold tracking-tight mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            Choose the Perfect Plan for Your Writing
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Upgrade anytime to unlock unlimited AI eBook creation, DOCX export, and premium authoring.
          </p>
        </div>

        {/* Active Subscription Banner with Cancel CTA */}
        {currentPlan !== 'free' && (
          <div className="max-w-2xl mx-auto mb-10 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Active Subscription</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                You are currently on the <span className="uppercase text-primary">{currentPlan}</span> plan.
              </p>
            </div>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-300 font-semibold text-xs transition-colors border border-red-200 dark:border-red-900 shrink-0"
            >
              Cancel Subscription & Downgrade
            </button>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPlans.map((plan) => {
            const meta = PLAN_META[plan.id] || PLAN_META.free;
            const Icon = meta.icon;
            const isCurrent = currentPlan === plan.id;
            const isLoading = paying === plan.id;
            const price =
              plan.amount === 0
                ? '₹0'
                : `₹${(plan.amount / 100).toLocaleString('en-IN')}`;
            const period = plan.amount === 0 ? 'forever' : '/ month';

            return (
              <div
                key={plan.id}
                className="rounded-2xl flex flex-col transition-all duration-200"
                style={{
                  background: meta.highlight ? '#7c3aed' : 'var(--color-card)',
                  border: isCurrent
                    ? '2px solid #22c55e'
                    : meta.highlight
                    ? '2px solid #7c3aed'
                    : '1px solid var(--color-border)',
                  boxShadow: meta.highlight
                    ? '0 8px 30px rgba(124,58,237,.3)'
                    : undefined,
                  position: 'relative',
                }}
              >
                {/* Badges */}
                {meta.badge && !isCurrent && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: 'white',
                      color: '#7c3aed',
                      border: '1px solid #ddd6fe',
                    }}
                  >
                    {meta.badge}
                  </div>
                )}
                {isCurrent && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: '#22c55e', color: 'white' }}
                  >
                    Active Plan
                  </div>
                )}

                <div className="p-6 flex-1">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: meta.highlight
                          ? 'rgba(255,255,255,.2)'
                          : 'var(--color-accent)',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: meta.highlight ? 'white' : meta.color }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={{
                          color: meta.highlight
                            ? 'rgba(255,255,255,.7)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {plan.name}
                      </p>
                      <div className="flex items-end gap-1 leading-none mt-0.5">
                        <span
                          className="text-2xl font-extrabold"
                          style={{
                            color: meta.highlight ? 'white' : 'var(--color-text)',
                          }}
                        >
                          {price}
                        </span>
                        <span
                          className="text-xs mb-0.5"
                          style={{
                            color: meta.highlight
                              ? 'rgba(255,255,255,.6)'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {period}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5">
                    {meta.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: meta.highlight ? 'white' : '#22c55e' }}
                        />
                        <span
                          style={{
                            color: meta.highlight
                              ? 'rgba(255,255,255,.9)'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buttons Action */}
                <div className="px-6 pb-6 space-y-2">
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || isLoading || plan.id === 'free'}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    style={
                      isCurrent
                        ? { background: '#dcfce7', color: '#166534', cursor: 'default' }
                        : meta.highlight
                        ? { background: 'white', color: '#7c3aed' }
                        : plan.id === 'free'
                        ? {
                            background: 'var(--color-accent)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'default',
                          }
                        : { background: 'var(--color-primary)', color: 'white' }
                    }
                  >
                    {isLoading && <span className="spinner" />}
                    {isCurrent
                      ? '✓ Active Plan'
                      : plan.id === 'free'
                      ? 'Free Forever'
                      : isLoading
                      ? 'Processing…'
                      : `Upgrade to ${plan.name}`}
                  </button>

                  {/* If user is on Pro or Enterprise, show Cancel option on their current card */}
                  {isCurrent && plan.id !== 'free' && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust note */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-secondary)' }}>
          🔒 Payments secured by Razorpay · Production HMAC Verified · Cancel anytime
        </p>
      </div>

      {/* Render Payment Checkout Modal when user clicks Upgrade */}
      {selectedPaymentPlan && (
        <PaymentModal
          planId={selectedPaymentPlan}
          onClose={() => setSelectedPaymentPlan(null)}
          onSuccess={() => setSelectedPaymentPlan(null)}
        />
      )}

      {/* Confirmation Dialog for Subscription Cancellation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelPlan}
        title="Cancel Subscription?"
        message="Are you sure you want to cancel your paid plan and downgrade to Free?"
      />
    </div>
  );
};

export default PricingPage;
