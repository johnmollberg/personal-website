import { usePageContext } from 'vike-react/usePageContext'
import {App} from '../components/App/App'
import { PageContext } from 'vike/types'

interface PageProps {
  context?: PageContext
}

export const Page = ({ context }: PageProps) => {
  return <App context={context || usePageContext()} />
}
