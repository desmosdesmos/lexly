import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl p-6 shadow-sm border border-border ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
