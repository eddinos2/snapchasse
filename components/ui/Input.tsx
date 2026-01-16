'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            {label}
            {props.required && <span className="text-primary-500 ml-1">*</span>}
          </label>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.005 }}
          className={clsx(
            'w-full px-4 py-3 input-modern',
            'focus:outline-none text-gray-900',
            'placeholder:text-gray-400 text-base',
            error && 'border-red-400 focus:border-red-500 focus:shadow-red-100',
            className
          )}
          {...(props as any)}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
