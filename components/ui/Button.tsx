'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
    
    const variants = {
      primary: 'btn-primary text-white',
      secondary: 'btn-secondary',
      accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-lg',
      ghost: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Chargement...
          </span>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
