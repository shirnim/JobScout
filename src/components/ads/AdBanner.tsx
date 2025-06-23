
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';

// This makes the adsbygoogle object available on the window
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const AdBanner = () => {
  const pathname = usePathname();
  const adSensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  
  // Re-push the ad on route changes
  useEffect(() => {
    if (!adSensePublisherId || adSensePublisherId === 'ca-pub-XXXXXXXXXXXXXXXX' || process.env.NODE_ENV !== 'production') {
        return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [pathname, adSensePublisherId]);

  // Show a placeholder in development or if the publisher ID is not set
  if (process.env.NODE_ENV !== 'production' || !adSensePublisherId || adSensePublisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
        <div className="flex items-center justify-center h-24 my-4 bg-muted/50 border border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">Ad Placeholder (Visible in Dev Mode)</p>
        </div>
    )
  }

  return (
    <Card className="my-4 overflow-hidden text-center min-h-[90px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adSensePublisherId}
          data-ad-slot="YOUR_AD_SLOT_ID" // IMPORTANT: Replace with your actual Ad Slot ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
    </Card>
  );
};

export default AdBanner;
