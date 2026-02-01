import { HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'primary' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  container?: boolean;
}

export default function Section({
  children,
  variant = 'default',
  padding = 'lg',
  container = true,
  className = '',
  ...props
}: SectionProps) {
  const variants = {
    default: 'bg-white dark:bg-neutral-900',
    muted: 'bg-neutral-50 dark:bg-neutral-800/50',
    primary: 'bg-primary-500 dark:bg-primary-600 text-white',
    gradient: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white',
  };

  const paddings = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-20 md:py-32',
  };

  return (
    <section
      className={`${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {container ? (
        <div className="container-custom">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && (
        <p className={`section-subtitle ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
