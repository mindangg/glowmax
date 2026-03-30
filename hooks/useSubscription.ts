import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionStatus } from '../types';
import { purchasePackage, restorePurchases as restoreRC } from '../lib/revenueCat';

const STORAGE_KEY = 'glowmax_subscription';

export function useSubscription() {
  const [isPaid, setIsPaid] = useState(false);
  const [isTrialUsed, setIsTrialUsed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const { isPaid: p, isTrialUsed: t } = JSON.parse(stored);
          setIsPaid(p);
          setIsTrialUsed(t);
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((paid: boolean, trialUsed: boolean) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isPaid: paid, isTrialUsed: trialUsed }));
  }, []);

  const purchaseWeekly = useCallback(async () => {
    const result = await purchasePackage('glowmax_weekly');
    if (result.success) {
      setIsPaid(true);
      persist(true, isTrialUsed);
    }
    return result;
  }, [isTrialUsed, persist]);

  const purchaseYearly = useCallback(async () => {
    const result = await purchasePackage('glowmax_yearly');
    if (result.success) {
      setIsPaid(true);
      persist(true, isTrialUsed);
    }
    return result;
  }, [isTrialUsed, persist]);

  const restore = useCallback(async () => {
    const result = await restoreRC();
    if (result.restored) {
      setIsPaid(true);
      persist(true, isTrialUsed);
    }
    return result;
  }, [isTrialUsed, persist]);

  const markTrialUsed = useCallback(() => {
    setIsTrialUsed(true);
    persist(isPaid, true);
  }, [isPaid, persist]);

  const subscriptionStatus: SubscriptionStatus = isPaid ? 'active' : isTrialUsed ? 'expired' : 'trial';

  return {
    isPaid,
    isTrialUsed,
    subscriptionStatus,
    purchaseWeekly,
    purchaseYearly,
    restorePurchases: restore,
    markTrialUsed,
  };
}
