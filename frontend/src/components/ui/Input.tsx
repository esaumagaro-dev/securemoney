import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">{icon}</div>}
          <input
            ref={ref}
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${icon ? "pl-11" : ""} ${rightIcon ? "pr-11" : ""} ${error ? "border-red-500 focus:ring-red-500/50" : ""} ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
