import React, { useState } from 'react';
import { FaCheckCircle, FaCreditCard, FaTimes } from 'react-icons/fa';

const DISMISSAL_KEY = 'odfel-payment-reminder-dismissed-v1';

const PaymentReminder = () => {
  const [visible, setVisible] = useState(() => localStorage.getItem(DISMISSAL_KEY) !== 'true');

  const dismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="payment-reminder" role="status" aria-live="polite">
      <div className="payment-reminder__glow" aria-hidden="true" />
      <div className="payment-reminder__icon" aria-hidden="true">
        <FaCreditCard />
      </div>
      <div className="payment-reminder__copy">
        <p className="payment-reminder__eyebrow">Payment reminder</p>
        <p className="payment-reminder__title">Please make your payment</p>
        <p className="payment-reminder__text">Your outstanding payment is still waiting for you.</p>
      </div>
      <button type="button" className="payment-reminder__done" onClick={dismiss}>
        <FaCheckCircle aria-hidden="true" />
        Dismiss
      </button>
      <button type="button" className="payment-reminder__close" onClick={dismiss} aria-label="Dismiss payment reminder">
        <FaTimes aria-hidden="true" />
      </button>
    </aside>
  );
};

export default PaymentReminder;