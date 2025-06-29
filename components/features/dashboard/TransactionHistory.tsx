"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getTransactionHistory } from '@/lib/services'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'

interface TransactionHistoryProps {
  userId: string
  networkId?: number
}

export function TransactionHistory({ userId, networkId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await getTransactionHistory(userId, undefined, undefined, networkId)
        setTransactions(data)
      } catch (err) {
        console.error('Error fetching transaction history:', err)
        setError('Failed to load transaction history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [userId, networkId])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '⬇️'
      case 'withdraw':
        return '⬆️'
      case 'yield':
        return '💰'
      default:
        return '🔄'
    }
  }

  const formatAmount = (amount: number, type: string) => {
    return `${type === 'withdraw' ? '-' : type === 'yield' ? '+' : ''}$${amount.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-[150px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground">No transactions yet</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center">
                    <span className="mr-2">{getTransactionIcon(tx.type)}</span>
                    <span className="capitalize">{tx.type}</span>
                    {tx.protocol && <span className="ml-2 text-muted-foreground">via {tx.protocol}</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </div>
                </div>
                <div className={`font-medium ${tx.type === 'withdraw' ? 'text-red-500' : tx.type === 'yield' ? 'text-green-500' : ''}`}>
                  {formatAmount(tx.amount, tx.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 