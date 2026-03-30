// RevenueCat mocked for Expo Go — real SDK requires EAS build.

export async function initRevenueCat(): Promise<void> {
  // No-op in Expo Go
}

export async function purchasePackage(_id: string): Promise<{ success: boolean }> {
  return { success: true };
}

export async function checkSubscription(): Promise<{ isActive: boolean }> {
  return { isActive: false };
}

export async function restorePurchases(): Promise<{ restored: boolean }> {
  return { restored: false };
}
