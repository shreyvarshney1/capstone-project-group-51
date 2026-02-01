"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { VoteButton } from "@/components/vote-button";
import { StatusBadge } from "@/components/status-timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  ArrowUp,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface FeedIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  isUrgent: boolean;
  images: string[];
  createdAt: string;
  category: {
    name: string;
  };
  user: {
    name: string;
    image?: string;
  };
  ward?: {
    name: string;
  };
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
}

interface Category {
  id: string;
  name: string;
}

type SortOption = "recent" | "votes" | "trending";

export default function FeedPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<FeedIssue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setIssues([]);
    fetchIssues(1, true);
  }, [searchQuery, selectedCategory, sortBy, selectedStatus]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchIssues = async (pageNum: number, reset: boolean = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: "10",
        sortBy,
      });

      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedStatus) params.set("status", selectedStatus);

      const response = await fetch(`/api/feed?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setIssues(data.data);
        } else {
          setIssues((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIssues(nextPage);
  };

  const handleVoteUpdate = (
    issueId: string,
    newVoteCount: number,
    hasVoted: boolean,
  ) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, voteCount: newVoteCount, hasVoted }
          : issue,
      ),
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Public Feed</h1>
        <p className="text-muted-foreground">
          Browse and engage with civic issues in your community
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Most Recent
                  </div>
                </SelectItem>
                <SelectItem value="votes">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Most Votes
                  </div>
                </SelectItem>
                <SelectItem value="trending">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Feed */}
      <div className="space-y-4">
        {isLoading && issues.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : issues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No issues found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        ) : (
          issues.map((issue) => (
            <Card
              key={issue.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2 text-pretty wrap-break-word"
                    >
                      {issue.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge
                        status={issue.status}
                        isUrgent={issue.isUrgent}
                        size="sm"
                      />
                      <Badge variant="outline">{issue.category.name}</Badge>
                      {issue.ward && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {issue.ward.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <VoteButton
                    issueId={issue.id}
                    initialVoteCount={issue.voteCount}
                    initialHasVoted={issue.hasVoted || false}
                    onVoteChange={(votes, hasVoted) =>
                      handleVoteUpdate(issue.id, votes, hasVoted)
                    }
                    size="lg"
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm line-clamp-3 text-pretty wrap-break-word">
                  {issue.description}
                </p>

                {/* Images */}
                {issue.images && issue.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {issue.images.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Issue image ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded-md shrink-0"
                      />
                    ))}
                    {issue.images.length > 3 && (
                      <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground shrink-0">
                        +{issue.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={issue.user.image} />
                    <AvatarFallback className="text-xs">
                      {issue.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="font-medium">{issue.user.name}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(issue.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/issues/${issue.id}#comments`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  {issue.commentCount}
                </Link>
              </CardFooter>
            </Card>
          ))
        )}

        {/* Load More */}
        {hasMore && issues.length > 0 && (
          <div className="flex justify-center py-4">
            <Button variant="outline" onClick={loadMore} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
