'use client';

import { useEffect } from 'react';
import { sdkService } from '@/features/game/sdk/cortexService';

export default function BootstrapGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdkService.init().catch(console.error);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <>{children}</>;
}
