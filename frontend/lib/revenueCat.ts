import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

// Entitlement identifier configured in RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

export async function initRevenueCat(): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return;
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
}

export async function purchasePackage(packageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return { success: false, error: 'Không tìm thấy gói.' };

    const pkg = current.availablePackages.find(
      (p) => p.identifier === packageId || p.product.identifier === packageId
    );
    if (!pkg) return { success: false, error: `Không tìm thấy gói: ${packageId}` };

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isActive };
  } catch (e: any) {
    if (e.userCancelled) return { success: false };
    return { success: false, error: e.message };
  }
}

export async function restorePurchases(): Promise<{ restored: boolean; error?: string }> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const restored = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { restored };
  } catch (e: any) {
    return { restored: false, error: e.message };
  }
}

export async function checkSubscription(): Promise<{ isActive: boolean }> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { isActive };
  } catch {
    return { isActive: false };
  }
}
