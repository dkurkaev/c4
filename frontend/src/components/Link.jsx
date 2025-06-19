import * as Headless from '@headlessui/react'
import { Link as RouterLink } from 'react-router-dom'
import { forwardRef } from 'react'

export const Link = forwardRef(function Link({ href, to, ...props }, ref) {
  // Используем to для React Router, href для обратной совместимости
  const linkTo = to || href
  
  return (
    <Headless.DataInteractive>
      <RouterLink to={linkTo} {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})