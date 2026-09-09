import type { ComponentProps } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function SkeletonShimmer({ className, ...props }: ComponentProps<typeof Skeleton>) {
  return <Skeleton className={cn('skeleton-shimmer animate-none', className)} {...props} />
}
