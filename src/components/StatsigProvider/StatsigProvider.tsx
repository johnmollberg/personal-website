import type { ReactNode } from 'react'
import { StatsigProvider as ReactStatsigProvider, useClientBootstrapInit } from '@statsig/react-bindings'
import { usePageContext } from 'vike-react/usePageContext'

interface StatsigProviderProps {
  children: ReactNode
}

export const StatsigProvider = ({
  children,
}: StatsigProviderProps) => {
  const context = usePageContext()
  const user = context?.data?.bootstrapValues?.user
  const bootstrapValues = context?.data?.bootstrapValues
  console.log('bootstrapValues', bootstrapValues)
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