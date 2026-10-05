import { useState, useEffect } from 'react';
import { User, Lock, Palette, CreditCard, Save, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/bookService';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tab, setTab] = useState('profile');
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const currentPlan = (user?.subscriptionPlan || user?.plan || 'FREE').toUpperCase();

  // Sync profile state when user updates or loads asynchronously
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  // Fetch payment history when billing tab is selected
  useEffect(() => {
    if (tab === 'billing') {
      setLoadingPayments(true);
      api
        .get('/payments/history')
        .then(({ data }) => {
          setPayments(data.payments || []);
        })
        .catch(() => {
          toast.error('Failed to load payment history');
        })
        .finally(() => setLoadingPayments(false));
    }
  }, [tab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name || profile.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await userService.updateProfile(profile);
      if (data.user) {
        updateUser(data.user);
      } else {
        updateUser({ name: profile.name, bio: profile.bio });
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPwd(true);
    try {
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancellingPlan(true);
    try {
      const { data } = await userService.downgradePlan();
      updateUser(
        data.user || {
          subscriptionPlan: 'FREE',
          plan: 'free',
          subscriptionStatus: 'cancelled',
        }
      );
      toast.success('Subscription cancelled. You are now on the Free plan.');
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancellingPlan(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text dark:text-text-secondary">Settings</h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
          Manage your account profile, preferences, subscription, and payment history
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-1 bg-accent dark:bg-card p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === id
                ? 'bg-white dark:bg-card text-text dark:text-text-secondary shadow-sm'
                : 'text-text-secondary dark:text-text-secondary hover:text-text dark:hover:text-text-secondary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-text dark:text-text-secondary">
            Profile Information
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-text dark:text-text-secondary">
                {user?.name || 'User'}
              </p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-accent dark:bg-accent text-primary dark:text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  {currentPlan} Plan
                </span>
                {currentPlan !== 'FREE' && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Cancel Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-secondary mb-1.5">
              Bio
            </label>
            <textarea
              value={profile.bio}
              rows={3}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself…"
              className="input-field resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary flex items-center gap-2"
          >
            {savingProfile ? <span className="spinner" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handlePasswordSave} className="card p-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-text dark:text-text-secondary">
            Change Password
          </h2>

          {['currentPassword', 'newPassword', 'confirm'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-text dark:text-text-secondary mb-1.5 capitalize">
                {field === 'confirm'
                  ? 'Confirm New Password'
                  : field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="password"
                value={passwords[field]}
                onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={savingPwd}
            className="btn-primary flex items-center gap-2"
          >
            {savingPwd ? <span className="spinner" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </form>
      )}

      {/* Appearance Tab */}
      {tab === 'appearance' && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <h2 className="font-semibold text-text dark:text-text-secondary">Appearance</h2>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-text dark:text-text-secondary">Dark Mode</p>
              <p className="text-sm text-text-secondary dark:text-text-secondary">
                Toggle between dark theme and light theme interface
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-accent dark:bg-card'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Billing & Payment History Tab */}
      {tab === 'billing' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Plan Management Card */}
          <div className="card p-6 border-l-4 border-l-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Current Subscription
                </span>
                <h3 className="text-xl font-bold text-text dark:text-text-secondary mt-1">
                  {currentPlan} Plan
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Status:{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {user?.subscriptionStatus || 'Active'}
                  </span>
                  {user?.subscriptionStart && (
                    <span className="ml-2">
                      · Member since{' '}
                      {new Date(user.subscriptionStart).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {currentPlan !== 'FREE' ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancellingPlan}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-300 font-semibold text-xs transition-colors border border-red-200 dark:border-red-900 shrink-0"
                >
                  {cancellingPlan ? 'Cancelling…' : 'Cancel Subscription'}
                </button>
              ) : (
                <span className="text-xs text-text-secondary font-medium">Free Forever Tier</span>
              )}
            </div>
          </div>

          {/* Payment History Table */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-text dark:text-text-secondary text-base">
              Transaction History
            </h3>

            {loadingPayments ? (
              <div className="p-8 text-center text-sm text-text-secondary animate-pulse">
                Loading payment history…
              </div>
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-secondary uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Order / Payment ID</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-accent/40">
                        <td className="py-3 px-3 text-text font-medium">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3 uppercase font-bold text-primary">
                          {p.plan}
                        </td>
                        <td className="py-3 px-3 font-semibold text-text">
                          ₹{(p.amount / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
                          {p.razorpayPaymentId || p.razorpayOrderId}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-text-secondary border border-dashed border-border rounded-xl">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No payment transactions found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Pro / Enterprise Subscription?"
        message="Are you sure you want to cancel your paid plan? You will immediately revert to the Free plan (max 5 books, 10 daily AI generations)."
      />
    </div>
  );
};

export default SettingsPage;
