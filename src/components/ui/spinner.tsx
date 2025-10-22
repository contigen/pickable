'use client'

import { useTheme } from 'next-themes'
import { RotatingLines } from 'react-loader-spinner'

export function Spinner({
  strokeColor,
  width,
  strokeWidth,
}: {
  strokeColor?: string
  width?: string
  strokeWidth?: string
}) {
  const { theme } = useTheme()
  return (
    <RotatingLines
      strokeColor={strokeColor || theme === 'dark' ? '#000' : '#fff'}
      strokeWidth={strokeWidth || '4'}
      width={width || '24'}
    />
  )
}
