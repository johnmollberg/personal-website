import type { ReactNode } from 'react'
import { StatsigProvider as ReactStatsigProvider, useClientBootstrapInit } from '@statsig/react-bindings'
import type { PageContext } from 'vike/types'


interface StatsigProviderProps {
  children: ReactNode
  context: PageContext
}

export const StatsigProvider = ({
  context,
  children,
}: StatsigProviderProps) => {
  const user = context?.data?.bootstrapValues?.user
  const bootstrapValues = context?.data?.bootstrapValues
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