import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, jest } from '@jest/globals'
import { WebVitals } from './WebVitals'

// Mock web-vitals library
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onLCP: jest.fn(),
  onFCP: jest.fn(),
  onTTFB: jest.fn(),
  CLSThresholds: [0.1, 0.25],
  INPThresholds: [200, 500],
  LCPThresholds: [2500, 4000],
  FCPThresholds: [1800, 3000],
  TTFBThresholds: [800, 1800],
}))

describe('WebVitals component', () => {
  test('renders Web Vitals heading', () => {
    render(<WebVitals />)
    expect(screen.getByText('Web Vitals')).toBeInTheDocument()
  })

  test('renders loading state for all metrics', () => {
    render(<WebVitals />)
    // Check that "Loading..." text appears for all 5 metrics
    const loadingTexts = screen.getAllByText('Loading...')
    expect(loadingTexts).toHaveLength(5)
  })

  test('loads with grayscale charts', () => {
    render(<WebVitals />)
    
    // The component should have 5 chart bars (one for each metric)
    // Each should have the grayscale class applied
    const chartBars = document.querySelectorAll('.chart-bar-grayscale')
    expect(chartBars.length).toBe(5)
  })

  test('includes loading animation cursors', () => {
    render(<WebVitals />)
    
    // Check that the animation cursors are included in the document
    const loadingCursors = document.querySelectorAll('.chart-loading-cursor')
    expect(loadingCursors.length).toBe(5)
  })
  
  test('metrics are clickable and open documentation links', () => {
    // Mock window.open
    window.open = jest.fn()
    
    render(<WebVitals />)
    
    // Get all metric charts
    const metricCharts = document.querySelectorAll('.metric-chart')
    expect(metricCharts.length).toBe(5)
    
    // Click on CLS chart and verify window.open was called with the right URL
    fireEvent.click(metricCharts[0])
    expect(window.open).toHaveBeenCalledWith('https://web.dev/articles/cls', '_blank', 'noopener,noreferrer')
    
    // Click on INP chart and verify window.open was called with the right URL
    fireEvent.click(metricCharts[1])
    expect(window.open).toHaveBeenCalledWith('https://web.dev/articles/inp', '_blank', 'noopener,noreferrer')
  })
})