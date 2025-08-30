"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading placeholder component
const Resume3DLoader = () => (
  <div className="relative h-96 w-full">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-2xl animate-pulse" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading 3D Resume...</p>
      </div>
    </div>
  </div>
);

// Dynamically import Resume3D with no SSR
const Resume3D = dynamic(
  () => import('./Resume3D').then(mod => mod.default),
  {
    loading: () => <Resume3DLoader />,
    ssr: false, // Disable server-side rendering for 3D components
  }
);

// Export wrapped component with Suspense boundary
export default function LazyResume3D() {
  return (
    <Suspense fallback={<Resume3DLoader />}>
      <Resume3D />
    </Suspense>
  );
}
