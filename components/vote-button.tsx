"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  issueId: string
  initialVoteCount: number
  initialHasVoted?: boolean
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  onVoteChange?: (voteCount: number, hasVoted: boolean) => void
  className?: string
}

export function VoteButton({
  issueId,
  initialVoteCount,
  initialHasVoted = false,
  size = "md",
  showCount = true,
  onVoteChange,
  className
}: VoteButtonProps) {
  const { data: session } = useSession()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async () => {
    if (!session) {
      // Redirect to login or show message
      alert("Please sign in to vote")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setVoteCount(data.voteCount)
        setHasVoted(data.voted)
        onVoteChange?.(data.voteCount, data.voted)
      }
    } catch (error) {
      console.error("Vote failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base"
  }

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        hasVoted && "bg-blue-600 hover:bg-blue-700",
        "transition-all duration-200",
        className
      )}
      aria-label={hasVoted ? "Remove vote" : "Upvote this issue"}
    >
      <ThumbsUp className={cn(
        "mr-1",
        size === "sm" ? "h-3 w-3" : "h-4 w-4",
        hasVoted && "fill-current"
      )} />
      {showCount && (
        <span>{voteCount}</span>
      )}
    </Button>
  )
}
