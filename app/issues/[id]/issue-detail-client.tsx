"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "@/components/vote-button";
import { CommentSection } from "@/components/comment-section";
import { StatusTimeline, StatusBadge } from "@/components/status-timeline";
import DynamicMap from "@/components/dynamic-map";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Flag,
  Share2,
  AlertTriangle,
  MessageSquare,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface IssueDetailClientProps {
  issue: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    isUrgent: boolean;
    imageUrl: string | null;
    images: string[];
    latitude: number;
    longitude: number;
    address: string | null;
    ward: string | null;
    block: string | null;
    district: string | null;
    state: string | null;
    aiClassification: any;
    sentimentScore: number | null;
    priorityScore: number | null;
    escalationLevel: string;
    createdAt: string;
    updatedAt: string;
    slaDueDate: string | null;
    escalatedAt: string | null;
    resolvedAt: string | null;
    category: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    assignedTo: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
    } | null;
    statusHistory: Array<{
      id: string;
      status?: string;
      toStatus?: string;
      note?: string | null;
      changedBy?: string | null;
      createdAt: string;
    }>;
    _count: {
      votes: number;
      comments: number;
    };
  };
}

export function IssueDetailClient({ issue }: IssueDetailClientProps) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;
  const isOfficer = [
    "WARD_OFFICER",
    "BLOCK_OFFICER",
    "DISTRICT_OFFICER",
    "STATE_OFFICER",
    "ADMIN",
    "SUPER_ADMIN",
  ].includes(userRole);

  // Get all images
  const allImages =
    issue.images.length > 0
      ? issue.images
      : issue.imageUrl
        ? [issue.imageUrl]
        : [];

  // Build location string - these are string fields, not objects
  const locationParts = [
    issue.ward,
    issue.block,
    issue.district,
    issue.state,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0 ? locationParts.join(", ") : issue.address;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: issue.title,
        text: issue.description.slice(0, 100),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-3 px-4 max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden py-0">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-background">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <VoteButton
                    issueId={issue.id}
                    initialVoteCount={issue._count.votes}
                    initialHasVoted={false}
                    size="lg"
                    className="bg-card hover:bg-card/80 text-foreground border border-border"
                  />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-pretty wrap-break-word">
                      {issue.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-background">
                      <span className="flex items-center gap-1 font-medium text-background">
                        {issue.user.name || "Anonymous"}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(issue.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span
                          className="truncate max-w-[200px] text-ellipsis"
                          title={issue.address || "Unknown"}
                        >
                          {issue.address || "Unknown Location"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-background text-foreground border border-border"
                >
                  {issue.category.name}
                </Badge>
                {issue.isUrgent && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Flag className="h-3 w-3" />
                    Urgent
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-muted-background hover:bg-muted"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-b">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {issue._count.votes}
              </div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {issue._count.comments}
              </div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
            <div className="p-4 text-center">
              <StatusBadge status={issue.status} size="lg" />
            </div>
            <div className="p-4 text-center">
              <Badge variant="outline" className="text-xs">
                {issue.priority}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap wrap-break-word text-pretty text-base leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {/* AI Classification Info (for officers) */}
                {isOfficer && issue.aiClassification && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="font-medium mb-2">AI Analysis</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        Confidence:{" "}
                        {(issue.aiClassification.confidence * 100).toFixed(0)}%
                      </div>
                      {issue.sentimentScore !== null && (
                        <div>
                          Sentiment:{" "}
                          {issue.sentimentScore > 0.3
                            ? "Positive"
                            : issue.sentimentScore < -0.3
                              ? "Negative"
                              : "Neutral"}
                        </div>
                      )}
                      {issue.priorityScore !== null && (
                        <div>
                          Priority Score: {issue.priorityScore.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            {allImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" />
                    Photo Evidence ({allImages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <Card className="pb-0 gap-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
                {issue.address && (
                  <CardDescription>{issue.address}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] border-t">
                  <DynamicMap
                    issues={[
                      {
                        id: issue.id,
                        title: issue.title,
                        description: issue.description,
                        latitude: issue.latitude,
                        longitude: issue.longitude,
                        status: issue.status,
                        category: issue.category,
                      },
                    ]}
                    showControls={false}
                    height="300px"
                  />
                </div>
                <div className="p-3 bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Lat: {issue.latitude.toFixed(6)}</span>
                  <span>Lng: {issue.longitude.toFixed(6)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div id="comments">
              <CommentSection issueId={issue.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <StatusTimeline
              currentStatus={issue.status}
              statusHistory={issue.statusHistory}
              isUrgent={issue.isUrgent}
              createdAt={issue.createdAt}
              slaDueDate={issue.slaDueDate || undefined}
              escalationLevel={issue.escalationLevel}
            />

            {/* Assigned Officer */}
            {issue.assignedTo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Assigned To</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={issue.assignedTo.image || undefined} />
                      <AvatarFallback>
                        {issue.assignedTo.name?.charAt(0) || "O"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{issue.assignedTo.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {issue.assignedTo.role.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Officer Actions */}
            {isOfficer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Officer Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    Change Priority
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    Assign to Officer
                  </Button>
                  {!issue.isUrgent && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-orange-600"
                      size="sm"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark as Urgent
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}
