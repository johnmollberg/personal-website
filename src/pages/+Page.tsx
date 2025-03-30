import {App} from '../components/App/App'
import { usePageContext } from 'vike-react/usePageContext'
export const Page = () => {
  console.log('rendering index page')
  const context = usePageContext()
  console.log('context', context)
  return <App />
}
