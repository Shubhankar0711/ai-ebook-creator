import { createContext, useContext, useState } from "react";
import { Lock, X } from "lucide-react";
import PaymentModal from "../components/ui/PaymentModal";

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const triggerUpgradeModal = (feature) => {
    setFeatureName(feature);
    setIsOpen(true);
  };

  const handleUpgradeClick = () => {
    setIsOpen(false);
    setShowCheckout(true);
  };

  return (
    <SubscriptionContext.Provider value={{ triggerUpgradeModal }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card p-6 rounded-2xl max-w-sm w-full mx-4 shadow-xl border border-border dark:border-border text-center relative animate-scale-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Unlock {featureName}
            </h3>
            <p className="text-xs text-text-secondary mt-2 mb-6 leading-relaxed">
              This feature requires a Pro or Enterprise subscription. Upgrade now to unlock full AI tools, DOCX export, and unlimited creation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-4 border border-border hover:bg-accent text-text-secondary rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeClick}
                className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <PaymentModal
          planId="pro"
          onClose={() => setShowCheckout(false)}
        />
      )}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
 const ctx = useContext(SubscriptionContext);
 if (!ctx)
 throw new Error("useSubscription must be used within SubscriptionProvider");
 return ctx;
};

