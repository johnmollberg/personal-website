import type { ReactNode } from 'react'
import { StatsigProvider as ReactStatsigProvider, useClientBootstrapInit } from '@statsig/react-bindings'

interface StatsigProviderProps {
  children: ReactNode
}

export const StatsigProvider = ({
  children,
}: StatsigProviderProps) => {
  const client = useClientBootstrapInit(
    'client-QdNLe7NYw1V3E6cuR7AseBeaHZSppsFLjXckQE8Dtp9',
    user,
    bootstrapValues,
  )
  return (
    <ReactStatsigProvider client={client}>
      {children}
    </ReactStatsigProvider>
  )
}