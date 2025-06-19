import React from 'react'
import clsx from 'clsx'

export function NavbarItem({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        className,
        'flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
      )}
    >
      {children}
    </button>
  )
} 