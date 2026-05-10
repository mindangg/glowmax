import { useScanStore } from '../store/scanStore';

export function useFullAnalysis() {
  const results         = useScanStore((s) => s.fullResults);
  const isLoading       = useScanStore((s) => s.fullLoading);
  const error           = useScanStore((s) => s.fullError);
  const triggerAnalysis = useScanStore((s) => s.triggerAnalysis);

  return { results, isLoading, error, triggerAnalysis };
}
