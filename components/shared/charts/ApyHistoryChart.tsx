"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApyHistory } from '@/lib/services'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ApyHistoryChartProps {
  protocol?: string
  networkId?: number
}

export function ApyHistoryChart({ protocol, networkId }: ApyHistoryChartProps) {
  const [apyData, setApyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApyHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getApyHistory(protocol, networkId)
        
        // Process data for the chart
        const processedData = processApyData(data)
        setApyData(processedData)
      } catch (err) {
        console.error('Error fetching APY history:', err)
        setError('Failed to load APY history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApyHistory()
  }, [protocol, networkId])

  // Process APY data for the chart
  const processApyData = (data: any[]) => {
    // Group by date
    const groupedByDate = data.reduce((acc, item) => {
      const date = format(new Date(item.timestamp), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = {}
      }
      acc[date][item.protocol] = item.apyValue
      return acc
    }, {})

    // Convert to array format for Recharts
    return Object.entries(groupedByDate).map(([date, values]: [string, any]) => ({
      date,
      ...values,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APY History</CardTitle>
          <CardDescription>Historical APY rates for DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APY History</CardTitle>
          <CardDescription>Historical APY rates for DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // Get unique protocols from the data
  const protocols = Array.from(
    new Set(
      apyData.flatMap(item => 
        Object.keys(item).filter(key => key !== 'date')
      )
    )
  )

  // Define colors for each protocol
  const protocolColors: Record<string, string> = {
    'Aave': '#B6509E',
    'Compound': '#00D395',
    'Lido': '#00A3FF',
    'Curve': '#FF0000',
    'Yearn': '#0657F9',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>APY History</CardTitle>
        <CardDescription>Historical APY rates for DeFi protocols</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={apyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ value: 'APY (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'APY']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {protocols.map((protocol) => (
                <Line
                  key={protocol}
                  type="monotone"
                  dataKey={protocol}
                  stroke={protocolColors[protocol] || '#8884d8'}
                  activeDot={{ r: 8 }}
                  name={protocol}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 