import type { ReactNode } from 'react'
import { StatsigProvider as ReactStatsigProvider, useClientBootstrapInit } from '@statsig/react-bindings'
import type { PageContextClient, PageContextServer } from 'vike/types'

interface StatsigProviderProps {
  children: ReactNode
  context: PageContextClient | PageContextServer
}

export const StatsigProvider = ({
  context,
  children,
}: StatsigProviderProps) => {
  // Use guardData if available, fallback to data for backwards compatibility
  const bootstrapValues = context?.guardData?.bootstrapValues || context?.data?.bootstrapValues
  const user = bootstrapValues?.user
  
  console.log('bootstrapValues in StatsigProvider:', bootstrapValues)
  
  const client = useClientBootstrapInit(
    'client-QdNLe7NYw1V3E6cuR7AseBeaHZSppsFLjXckQE8Dtp9',
    user,
    JSON.stringify(bootstrapValues),
  )
  
  return (
    <ReactStatsigProvider client={client}>
      {children}
    </ReactStatsigProvider>
  )
}