import { usePageContext } from 'vike-react/usePageContext'
import {App} from '../../components/App/App'

export const Page = () => {
  console.log('rendering posts page')
  const context = usePageContext()
  console.log('context', context)
  return <App />
}
