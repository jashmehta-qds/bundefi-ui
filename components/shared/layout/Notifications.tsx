"use client"

import { useWallets } from "@privy-io/react-auth"
import { ArrowLeftRight, Bell, CheckCircle, Coins, ExternalLink, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/services"
import { Notification } from "@/types/notifications"

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Ensure both dates are compared in UTC
  const utcDate = new Date(date.getTime());
  const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  
  const seconds = Math.floor((utcNow.getTime() - utcDate.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function Notifications() {
  const { wallets } = useWallets()
  const connectedWallet = wallets[0]
  const user = { address: connectedWallet?.address }
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    
    if (notification.title.includes('Cross-Chain')) {
      return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
    }
    
    if (notification.title.includes('Transaction')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    return <Coins className="h-4 w-4 text-yellow-500" />
  }

  const fetchNotifications = async () => {
    if (!user?.address) return
    try {
      const data = await getUnreadNotifications(user.address)
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(notifications.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.address) return
    try {
      await markAllNotificationsAsRead(user.address)
      setNotifications([])
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Set up interval for fetching notifications every 2 minutes
  useEffect(() => {
    // Initial fetch
    fetchNotifications()
    
    // Set up interval (1 minute = 60,000 milliseconds)
    intervalRef.current = setInterval(fetchNotifications, 60000)
    
    // Cleanup function to clear interval when component unmounts or user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user?.address]) // Re-run when user address changes

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="h-10 relative bg-primary-200/30 text-white">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b border-secondary-700/50">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.isRead ? 'bg-muted/50' : ''
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-2 w-full">
                {getNotificationIcon(notification)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 break-words">
                    {notification.message}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 w-full">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification.createdAt)}
                </span>
                {notification.transaction?.txHash && (
                  <div className="flex gap-2 ml-auto">
                    <a
                      href={`${notification.transaction.network.explorerUrl}/tx/${notification.transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Explorer
                    </a>
                    {notification.title.includes("Cross-Chain") && (
                      <a
                        href={`https://ccip.chain.link/tx/${notification.transaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        CCIP
                      </a>
                    )}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 