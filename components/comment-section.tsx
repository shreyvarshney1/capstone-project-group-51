"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Reply, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  createdAt: string | Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  issueId: string
  comments?: Comment[]
  onCommentAdded?: () => void
}

export function CommentSection({ issueId, comments: initialComments, onCommentAdded }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments || [])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialComments)

  // Fetch comments if not provided initially
  useEffect(() => {
    if (!initialComments) {
      fetchComments()
    }
  }, [issueId, initialComments])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (parentId?: string) => {
    if (!session) {
      alert("Please sign in to comment")
      return
    }

    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId })
      })

      if (response.ok) {
        const comment = await response.json()
        
        if (parentId) {
          // Add reply to parent comment
          setComments(prev => prev.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), comment] }
            }
            return c
          }))
          setReplyContent("")
          setReplyingTo(null)
        } else {
          // Add new top-level comment
          setComments(prev => [comment, ...prev])
          setNewComment("")
        }
        
        onCommentAdded?.()
      }
    } catch (error) {
      console.error("Comment failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/issues/${issueId}/comments?commentId=${commentId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        // Remove from state
        setComments(prev => prev.filter(c => c.id !== commentId).map(c => ({
          ...c,
          replies: c.replies?.filter(r => r.id !== commentId)
        })))
      }
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? "ml-8 mt-3" : "mb-4"}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.image || ""} alt={comment.user.name || ""} />
        <AvatarFallback>{comment.user.name?.[0] || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{comment.user.name || "Anonymous"}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {!isReply && session && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {session?.user?.id === comment.user.id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-600 hover:text-red-700"
              onClick={() => handleDeleteComment(comment.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
        
        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={() => handleSubmitComment(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
              >
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Replies */}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* New comment input */}
      {session ? (
        <div className="flex gap-3 mb-6">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
            <AvatarFallback>{session.user?.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={() => handleSubmitComment()}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-4">
          Please sign in to leave a comment.
        </p>
      )}

      {/* Comments list */}
      <div className="divide-y">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="py-4 first:pt-0">
              <CommentItem comment={comment} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
