import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getSocket } from '@/shared/lib/socket'

export function useSocketReconnectReconciliation(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getSocket()
    let hasConnectedBefore = false

    function handleConnect() {
      if (!hasConnectedBefore) {
        hasConnectedBefore = true
        return
      }
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
      queryClient.invalidateQueries({ queryKey: ['nft-detail'] })
    }

    socket.on('connect', handleConnect)
    return () => {
      socket.off('connect', handleConnect)
    }
  }, [queryClient])
}
