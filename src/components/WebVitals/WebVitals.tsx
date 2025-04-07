import { useEffect, useState } from 'react'
import type {
  Metric,
  MetricRatingThresholds} from 'web-vitals'
import {
  onCLS, onINP, onLCP, onFCP, onTTFB,
  CLSThresholds,
  INPThresholds,
  LCPThresholds,
  FCPThresholds,
  TTFBThresholds
} from 'web-vitals'
import './WebVitals.scss'

interface Vitals {
  cls: number | null
  inp: number | null
  lcp: number | null
  fcp: number | null
  ttfb: number | null
}

// Documentation URLs for each metric
const docUrls: Record<string, string> = {
  cls: 'https://web.dev/articles/cls',
  inp: 'https://web.dev/articles/inp',
  lcp: 'https://web.dev/articles/lcp',
  fcp: 'https://web.dev/articles/fcp',
  ttfb: 'https://web.dev/articles/ttfb',
}


const thresholds: Record<string, MetricRatingThresholds> = {
  cls: CLSThresholds,
  inp: INPThresholds,
  lcp: LCPThresholds,
  fcp: FCPThresholds,
  ttfb: TTFBThresholds,
}

// Define units for each metric
const units: Record<string, string> = {
  cls: '',
  inp: 'ms',
  lcp: 'ms',
  fcp: 'ms',
  ttfb: 'ms'
}

// Label formatting for each metric
const formatValue = (metric: string, value: number | null): string => {
  if (value === null) return 'Loading...'
  
  // Format value based on metric type
  let formattedValue = value
  
  // For CLS, show up to 2 decimal places
  if (metric === 'cls') {
    formattedValue = Math.round(value * 100) / 100
  } 
  // For time-based metrics, round to the nearest integer
  else {
    formattedValue = Math.round(value)
  }
  
  return `${formattedValue}${units[metric]}`
}

// Performance scale for visualization
const MetricChart: React.FC<{ 
  metricName: string
  value: number | null
}> = ({ metricName, value }) => {
  const isLoading = value === null
  
  const [good, needsImprovement] = thresholds[metricName]
  const max = needsImprovement * 1.5 // Set max value for chart scale
  
  // Calculate position for the marker (percentage of the total width)
  let position = 0
  
  if (!isLoading) {
    if (value <= good) {
      position = (value / good) * 33.3
    } else if (value <= needsImprovement) {
      position = 33.3 + ((value - good) / (needsImprovement - good)) * 33.3
    } else {
      position = 66.6 + Math.min(33.3, ((value - needsImprovement) / (max - needsImprovement)) * 33.3)
    }
    
    // Ensure position doesn't exceed 100%
    position = Math.min(position, 100)
  }
  
  // Determine value color class
  let valueColorClass = 'metric-value-loading'
  if (!isLoading) {
    if (value <= good) {
      valueColorClass = 'metric-value-good'
    } else if (value <= needsImprovement) {
      valueColorClass = 'metric-value-needs-improvement'
    } else {
      valueColorClass = 'metric-value-poor'
    }
  }
  
  // Handle click to open documentation
  const handleClick = () => {
    window.open(docUrls[metricName], '_blank', 'noopener,noreferrer')
  }
  
  return (
    <div className="metric-chart" onClick={handleClick} role="link" aria-label={`Learn more about ${metricName.toUpperCase()}`}>
      <div className="metric-header">
        <span className="metric-name">{metricName.toUpperCase()}</span>
        <span className={`metric-value ${valueColorClass}`}>
          {formatValue(metricName, value)}
        </span>
      </div>
      <div className="chart-container">
        {/* Chart bar */}
        <div className={`chart-bar ${isLoading ? 'chart-bar-grayscale' : ''}`}>
          <div className="chart-segments">
            <div className="chart-segment-good" /> {/* Good (green) */}
            <div className="chart-segment-needs-improvement" /> {/* Needs Improvement (orange) */}
            <div className="chart-segment-poor" /> {/* Poor (red) */}
          </div>
          
          {/* Marker for the current value or loading animation */}
          {isLoading ? (
            <div className="chart-marker chart-loading-cursor" />
          ) : (
            <div 
              className="chart-marker" 
              style={{ left: `${position}%` }}
            />
          )}
        </div>
        
        {/* Value Labels */}
        <div className={`chart-labels ${isLoading ? 'chart-labels-loading' : ''}`}>
          <span>0{units[metricName]}</span>
          <span>{metricName === 'cls' ? good : Math.round(good)}{units[metricName]}</span>
          <span>{metricName === 'cls' ? needsImprovement : Math.round(needsImprovement)}{units[metricName]}</span>
          <span>{metricName === 'cls' ? max.toFixed(2) : Math.round(max)}{units[metricName]}</span>
        </div>
      </div>
    </div>
  )
}

export const WebVitals = () => {
  const [vitals, setVitals] = useState<Vitals>({
    cls: null,
    inp: null,
    lcp: null,
    fcp: null,
    ttfb: null,
  })

  useEffect(() => {
    const updateMetric = (name: keyof Vitals) => (metric: Metric) => {
      setVitals((prev) => ({ ...prev, [name]: metric.value }))
    }

    onCLS(updateMetric('cls'))
    onINP(updateMetric('inp'))
    onLCP(updateMetric('lcp'))
    onFCP(updateMetric('fcp'))
    onTTFB(updateMetric('ttfb'))
  }, [])

  return (
    <div className="web-vitals-container">
      <h1 className="web-vitals-title">Web Vitals</h1>
      <div>
        <MetricChart metricName="cls" value={vitals.cls} />
        <MetricChart metricName="inp" value={vitals.inp} />
        <MetricChart metricName="lcp" value={vitals.lcp} />
        <MetricChart metricName="fcp" value={vitals.fcp} />
        <MetricChart metricName="ttfb" value={vitals.ttfb} />
      </div>
    </div>
  )
}