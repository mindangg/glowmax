import { useScanStore } from '../store/scanStore';

export function useTrialScan() {
  const trialResult   = useScanStore((s) => s.trialResult);
  const trialState    = useScanStore((s) => s.trialState);
  const isLoading     = useScanStore((s) => s.trialLoading);
  const error         = useScanStore((s) => s.trialError);
  const triggerTrialScan = useScanStore((s) => s.triggerTrialScan);

  return { trialResult, trialState, isLoading, error, triggerTrialScan };
}
