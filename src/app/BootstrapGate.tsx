'use client';

import { useEffect } from 'react';
import { sdkService } from '@/lib/sdk/cortexService';

export default function BootstrapGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdkService.init().catch(console.error);
  }, []);

  return <>{children}</>;
}
