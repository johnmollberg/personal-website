import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { PostList } from './PostList'
import type { PostMetadata } from '../../utils/posts'

// Mock the usePageContext hook
vi.mock('vike-react/usePageContext', () => ({
  usePageContext: vi.fn().mockReturnValue({
    data: { userTimeZone: 'America/New_York' }
  })
}))

// Mock the formatDateWithTimeZone function
vi.mock('../../utils/posts', () => ({
  formatDateWithTimeZone: vi.fn((date) => `Formatted: ${date}`)
}))

describe('PostList component', () => {
  const mockPosts: PostMetadata[] = [
    {
      title: 'Test Post 1',
      date: '2025-04-01',
      slug: 'test-post-1',
      description: 'This is test post 1'
    },
    {
      title: 'Test Post 2',
      date: '2025-03-15',
      slug: 'test-post-2',
      description: 'This is test post 2'
    }
  ]

  test('renders blog posts heading', () => {
    render(<PostList posts={mockPosts} />)
    expect(screen.getByText('Blog Posts')).toBeInTheDocument()
  })

  test('renders all posts with correct links', () => {
    render(<PostList posts={mockPosts} />)
    
    // Check that both post titles are rendered
    expect(screen.getByText('Test Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Post 2')).toBeInTheDocument()
    
    // Check descriptions
    expect(screen.getByText('This is test post 1')).toBeInTheDocument()
    expect(screen.getByText('This is test post 2')).toBeInTheDocument()
    
    // Check that dates are formatted
    expect(screen.getByText('Formatted: 2025-04-01')).toBeInTheDocument()
    expect(screen.getByText('Formatted: 2025-03-15')).toBeInTheDocument()
    
    // Check that links have correct hrefs
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/posts/test-post-1')
    expect(links[1]).toHaveAttribute('href', '/posts/test-post-2')
  })

  test('handles empty posts array', () => {
    render(<PostList posts={[]} />)
    
    // Heading should still be present
    expect(screen.getByText('Blog Posts')).toBeInTheDocument()
    
    // No post items should be rendered
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  test('uses default timezone when context is not available', () => {
    // Override the mock to return undefined data
    const { usePageContext } = vi.importMock('vike-react/usePageContext')
    usePageContext.mockReturnValueOnce({})
    
    render(<PostList posts={mockPosts} />)
    
    // Component should still render without errors
    expect(screen.getByText('Blog Posts')).toBeInTheDocument()
    
    // formatDateWithTimeZone should be called with default 'UTC' timezone
    const { formatDateWithTimeZone } = vi.importMock('../../utils/posts')
    expect(formatDateWithTimeZone).toHaveBeenCalledWith('2025-04-01', 'UTC')
  })
})