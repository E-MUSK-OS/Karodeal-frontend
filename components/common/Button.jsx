import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  href = null,
  className = '',
  isLoading = false,
  disabled = false,
  as = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading;
  const isNone = variant === 'none';
  const baseClasses = `btn group inline-flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 focus:outline-none whitespace-nowrap ${isDisabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${!isNone ? 'font-bold uppercase rounded-full shadow-sm hover:shadow-md' : ''}`;

  const variants = {
    primary: "bg-black text-white hover:bg-neutral-700 border border-black hover:border-neutral-700",
    secondary: "bg-neutral-100 text-black hover:bg-neutral-200 border border-transparent",
    outline: "bg-white text-black hover:bg-neutral-50 border border-neutral-200 hover:border-black",
    ghost: "text-neutral-500 hover:text-black border border-transparent hover:border-neutral-200 shadow-none hover:shadow-none",
    none: ""
  };

  const sizes = {
    sm: "px-3 py-1.8 sm:px-4 sm:py-2",
    md: "px-4 py-3 sm:px-6 sm:py-2.5",
    lg: " px-6 py-4 sm:px-8 sm:py-3.5 md:px-10 md:py-4",
    none: ""
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (icon && <span>{icon}</span>)}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  const Component = as;
  return (
    <Component className={classes} disabled={isDisabled} {...props}>
      {content}
    </Component>
  );
}
