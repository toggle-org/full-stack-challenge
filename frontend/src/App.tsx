import { useEffect, useMemo, useState } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './App.css';
import { api, setAuthToken } from './api';
import type { Plan, VpnConfig } from './types';

type Screen = 'landing' | 'login' | 'account';
type AccountTab = 'account-info' | 'configurations';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

function App() {
  return (
    <Elements stripe={stripePromise}>
      <VpnLandingApp />
    </Elements>
  );
}

function VpnLandingApp() {
  const stripe = useStripe();
  const elements = useElements();

  const [screen, setScreen] = useState<Screen>('landing');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [vpnConfig, setVpnConfig] = useState<VpnConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [accountTab, setAccountTab] = useState<AccountTab>('account-info');

  const hasConfig = Boolean(vpnConfig?.configuration);
  const configStatusLabel = hasConfig ? 'Assigned' : 'Not assigned';

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId],
  );

  useEffect(() => {
    void (async () => {
      const response = await api.get<Plan[]>('/plans');
      setPlans(response.data);
      if (response.data[0]) {
        setSelectedPlanId(response.data[0].id);
      }
    })();
  }, []);

  const handleBuy = async () => {
    if (!selectedPlan || !stripe || !elements) {
      return;
    }

    setBuyError('');
    setBuyLoading(true);

    try {
      const intentResponse = await api.post<{
        clientSecret: string;
        paymentIntentId: string;
      }>('/payments/create-intent', {
        planId: selectedPlan.id,
        email,
      });

      const card = elements.getElement(CardElement);
      if (!card) {
        throw new Error('Card element is not initialized');
      }

      const confirmResult = await stripe.confirmCardPayment(
        intentResponse.data.clientSecret,
        {
          payment_method: {
            card,
            billing_details: { email },
          },
        },
      );

      if (confirmResult.error || !confirmResult.paymentIntent) {
        throw new Error(confirmResult.error?.message ?? 'Payment confirmation failed');
      }

      const paymentMethod = confirmResult.paymentIntent.payment_method;
      if (!paymentMethod || typeof paymentMethod !== 'string') {
        throw new Error('Payment method is missing');
      }

      await api.post('/subscriptions/create', {
        planId: selectedPlan.id,
        paymentMethodId: paymentMethod,
        email,
      });

      setLoginEmail(email);
      setScreen('login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      setBuyError(message);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await api.post<{ accessToken: string }>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      setAuthToken(response.data.accessToken);
      setAccountTab('account-info');
      setScreen('account');
      await loadAssignedConfig();
    } catch {
      setLoginError('Invalid credentials. Use generated password from backend logs.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadAssignedConfig = async () => {
    setConfigError('');
    setConfigLoading(true);
    try {
      const response = await api.get<VpnConfig | null>('/vpn-configs/me');
      setVpnConfig(response.data);
    } catch {
      setConfigError('Could not load VPN configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleAssignConfig = async () => {
    setConfigError('');
    setConfigLoading(true);

    try {
      const response = await api.post<VpnConfig>('/vpn-configs/assign');
      setVpnConfig(response.data);
    } catch {
      setConfigError('Could not assign VPN configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  if (screen === 'login') {
    return (
      <main className="container">
        <section className="card">
          <h1>Login to your VPN account</h1>
          <p>Use the password generated after subscription (printed in backend console).</p>
          <label>
            Email
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
          </label>
          {loginError ? <p className="error">{loginError}</p> : null}
          <button className="action-button" disabled={loginLoading} onClick={handleLogin}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'account') {
    return (
      <main className="container">
        <section className="card account-card">
          <aside className="account-sidebar" aria-label="Account sections" role="tablist">
            <button
              type="button"
              className={`tab-button ${accountTab === 'account-info' ? 'active' : ''}`}
              role="tab"
              id="tab-account-info"
              aria-selected={accountTab === 'account-info'}
              aria-controls="panel-account-info"
              tabIndex={accountTab === 'account-info' ? 0 : -1}
              onClick={() => setAccountTab('account-info')}
            >
              Account info
            </button>
            <button
              type="button"
              className={`tab-button ${accountTab === 'configurations' ? 'active' : ''}`}
              role="tab"
              id="tab-configurations"
              aria-selected={accountTab === 'configurations'}
              aria-controls="panel-configurations"
              tabIndex={accountTab === 'configurations' ? 0 : -1}
              onClick={() => setAccountTab('configurations')}
            >
              Configurations
              <span className={`tab-status ${hasConfig ? 'assigned' : 'missing'}`}>
                {configStatusLabel}
              </span>
            </button>
          </aside>

          <div className="account-content">
            <header className="account-header">
              <h1>{accountTab === 'account-info' ? 'Your VPN account' : 'Configurations'}</h1>
            </header>

            {accountTab === 'account-info' ? (
              <div
                id="panel-account-info"
                role="tabpanel"
                aria-labelledby="tab-account-info"
              >
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span>{loginEmail}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Configuration status</span>
                    <span>{configStatusLabel}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="panel-configurations"
                role="tabpanel"
                aria-labelledby="tab-configurations"
                className="config-panel"
              >
                <button
                  className="action-button"
                  disabled={configLoading}
                  onClick={handleAssignConfig}
                >
                  {configLoading
                    ? 'Loading...'
                    : hasConfig
                      ? 'Regenerate configuration'
                      : 'Assign configuration'}
                </button>

                {configError ? <p className="error">{configError}</p> : null}

                <div className="config-box">
                  {vpnConfig?.configuration ?? (
                    <ol className="empty-steps">
                      <li>Click “Assign configuration”.</li>
                      <li>Copy the generated VPN configuration.</li>
                      <li>Import it into your VPN client.</li>
                    </ol>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <h1>UltraVPN</h1>
        <p>
          Private, secure, and blazing-fast VPN service for personal and business
          use.
        </p>

        <h2>Select plan</h2>
        <div className="plans">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`plan ${selectedPlanId === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <div className="plan-title">
                {plan.name} — ${(plan.priceCents / 100).toFixed(2)}/month
              </div>
              <div>{plan.description}</div>
            </button>
          ))}
        </div>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {selectedPlan ? (
          <div className="card-element-wrap">
            <CardElement />
          </div>
        ) : null}

        {buyError ? <p className="error">{buyError}</p> : null}
        <button
          className="action-button"
          disabled={!selectedPlan || !email || buyLoading || !stripe}
          onClick={handleBuy}
        >
          {buyLoading ? 'Processing...' : 'Buy'}
        </button>
      </section>
    </main>
  );
}

export default App;
