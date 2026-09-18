import React from 'react';
import { FaCreditCard, FaLock } from 'react-icons/fa';

const PaymentLock = () => (
  <main className="payment-lock" aria-live="assertive">
    <div className="payment-lock__rings" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="payment-lock__card">
      <div className="payment-lock__icon" aria-hidden="true">
        <FaCreditCard />
      </div>
      <div className="payment-lock__lock" aria-hidden="true">
        <FaLock />
      </div>
      <p className="payment-lock__eyebrow">Account access restricted</p>
      <h1>Please make your payment</h1>
      <p className="payment-lock__message">
        Your payment is required before you can access this website. Please complete your payment to continue.
      </p>
    </div>
  </main>
);

export default PaymentLock;