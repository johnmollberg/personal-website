import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PostContent } from './PostContent'
import type { Post } from '../../utils/posts'

// Define mocks using vi.hoisted to ensure proper hoisting
const mockUsePageContext = vi.hoisted(() => vi.fn())
const mockFormatDateWithTimeZone = vi.hoisted(() => vi.fn())

// Mock dependencies
vi.mock('vike-react/usePageContext', () => ({
  usePageContext: mockUsePageContext
}))

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  )
}))

vi.mock('../../utils/posts', () => ({
  formatDateWithTimeZone: mockFormatDateWithTimeZone
}))

// Reset mocks before each test
beforeEach(() => {
  mockUsePageContext.mockReset().mockReturnValue({
    data: { userTimeZone: 'America/New_York' }
  })
  mockFormatDateWithTimeZone.mockReset().mockImplementation((date) => `Formatted: ${date}`)
})

describe('PostContent component', () => {
  const mockPost: Post = {
    title: 'Test Post Title',
    date: '2025-04-01',
    slug: 'test-post',
    description: 'This is a test post description',
    content: '# Markdown Content\n\nThis is the content of the post.'
  }

  test('renders post title and metadata', () => {
    render(<PostContent post={mockPost} />)
    
    // Check that title is rendered
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    
    // Check that formatted date is rendered
    expect(screen.getByText('Formatted: 2025-04-01')).toBeInTheDocument()
    
    // Check that description is rendered
    expect(screen.getByText('This is a test post description')).toBeInTheDocument()
  })

  test('renders markdown content', () => {
    render(<PostContent post={mockPost} />)
    
    // Check that content is passed to ReactMarkdown
    const markdownContent = screen.getByTestId('markdown-content')
    expect(markdownContent).toBeInTheDocument()
    // The newlines might be normalized in the content, so we test individual parts
    expect(markdownContent).toHaveTextContent('# Markdown Content')
    expect(markdownContent).toHaveTextContent('This is the content of the post')
  })

  test('handles post without description', () => {
    const postWithoutDescription = { ...mockPost, description: '' }
    render(<PostContent post={postWithoutDescription} />)
    
    // Should still render without errors
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    
    // Description element should not be present
    expect(screen.queryByText('This is a test post description')).not.toBeInTheDocument()
  })

  test('uses default timezone when context is not available', () => {
    // Override the mock to return undefined data
    mockUsePageContext.mockReturnValueOnce({})
    
    render(<PostContent post={mockPost} />)
    
    // Component should still render without errors
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    
    // formatDateWithTimeZone should be called with default 'UTC' timezone
    expect(mockFormatDateWithTimeZone).toHaveBeenCalledWith('2025-04-01', 'UTC')
  })
})