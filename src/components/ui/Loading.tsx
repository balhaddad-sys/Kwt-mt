import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}: LoadingProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2
        className={`${sizes[size]} animate-spin text-primary-500 dark:text-accent-500`}
      />
      {text && (
        <p className="text-neutral-600 dark:text-neutral-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}

export function LoadingSection({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="py-20 flex items-center justify-center">
      <Loading size="md" text={text} />
    </div>
  );
}
