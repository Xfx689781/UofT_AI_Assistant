'use client'

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

export interface RadarDataPoint {
  subject: string
  value: number
  fullMark: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  color?: string
}

const DEFAULT_COLOR = '#0066CC'

export default function RadarChart({ data, color = DEFAULT_COLOR }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#1e2a3a" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#8b9aad', fontSize: 11 }}
          tickLine={{ stroke: '#1e2a3a' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 5]}
          tick={{ fill: '#6b7a8d', fontSize: 10 }}
          tickCount={6}
        />
        <Radar
          name="Rating"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#121922',
            border: '1px solid #1e2a3a',
            borderRadius: '8px',
            color: '#e8ecf1',
          }}
          labelStyle={{ color: '#8b9aad' }}
          formatter={(value: number) => [`${value.toFixed(1)} / 5`, 'Rating']}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={() => 'Rating'}
          iconType="circle"
          iconSize={8}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
