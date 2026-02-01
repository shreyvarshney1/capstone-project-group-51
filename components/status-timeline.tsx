"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  ArrowUp,
  FileText,
  MessageSquare,
  Flag,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface StatusHistoryItem {
  id: string;
  status?: string;
  toStatus?: string;
  fromStatus?: string | null;
  comment?: string | null;
  note?: string | null;
  changedBy?:
    | string
    | {
        name: string | null;
        role: string;
      }
    | null;
  createdAt: string;
}

interface StatusTimelineProps {
  currentStatus: string;
  statusHistory: StatusHistoryItem[];
  isUrgent?: boolean;
  createdAt: string;
  slaDueDate?: string;
  escalationLevel?: string | number;
}

// Map enum values to numbers for display
const ESCALATION_LEVEL_MAP: Record<string, number> = {
  WARD: 1,
  BLOCK: 2,
  DISTRICT: 3,
  STATE: 4,
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
  }
> = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <Clock className="h-4 w-4" />,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <FileText className="h-4 w-4" />,
  },
  ASSIGNED: {
    label: "Assigned",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: <User className="h-4 w-4" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: <ArrowUp className="h-4 w-4" />,
  },
  ESCALATED: {
    label: "Escalated",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  CLOSED: {
    label: "Closed",
    color: "text-muted-foreground",
    bgColor: "bg-muted dark:bg-muted/50",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  REOPENED: {
    label: "Reopened",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: <Flag className="h-4 w-4" />,
  },
};

const ESCALATION_LEVELS: Record<
  number,
  { label: string; description: string }
> = {
  1: { label: "Level 1", description: "Ward Officer" },
  2: { label: "Level 2", description: "Block Officer" },
  3: { label: "Level 3", description: "District Officer" },
  4: { label: "Level 4", description: "State Officer" },
};

export function StatusTimeline({
  currentStatus,
  statusHistory,
  isUrgent,
  createdAt,
  slaDueDate,
  escalationLevel: rawEscalationLevel,
}: StatusTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert escalation level to number
  const escalationLevel =
    typeof rawEscalationLevel === "string"
      ? ESCALATION_LEVEL_MAP[rawEscalationLevel] || 1
      : rawEscalationLevel || 1;

  const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

  // Calculate SLA status
  const getSlaStatus = () => {
    if (!slaDueDate) return null;

    const now = new Date();
    const due = new Date(slaDueDate);
    const hoursRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return {
        status: "breached",
        label: "SLA Breached",
        color: "destructive" as const,
      };
    } else if (hoursRemaining < 24) {
      return {
        status: "warning",
        label: "Due Soon",
        color: "secondary" as const,
      };
    }
    return {
      status: "ok",
      label: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color: "outline" as const,
    };
  };

  const slaStatus = getSlaStatus();
  const displayHistory = isExpanded ? statusHistory : statusHistory.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status Timeline</CardTitle>
          <div className="flex items-center gap-2">
            {isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Urgent
              </Badge>
            )}
            {escalationLevel && escalationLevel > 1 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                {ESCALATION_LEVELS[escalationLevel]?.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Card */}
        <div className={`p-3 rounded-lg ${currentConfig.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={currentConfig.color}>{currentConfig.icon}</div>
              <span className={`font-medium ${currentConfig.color}`}>
                {currentConfig.label}
              </span>
            </div>
            {slaStatus && (
              <Badge variant={slaStatus.color}>
                <Clock className="h-3 w-3 mr-1" />
                {slaStatus.label}
              </Badge>
            )}
          </div>
          {escalationLevel && escalationLevel > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              Handled by: {ESCALATION_LEVELS[escalationLevel]?.description}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          {/* Created */}
          <div className="relative flex items-start gap-3 pb-4">
            <div className="relative z-10 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium">Issue Created</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(createdAt), "PPp")}
              </p>
            </div>
          </div>

          {/* Status History */}
          {displayHistory.map((item, index) => {
            const statusKey = item.status || item.toStatus || "PENDING";
            const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
            const changedByName =
              typeof item.changedBy === "string"
                ? item.changedBy
                : item.changedBy?.name;
            return (
              <div
                key={item.id}
                className="relative flex items-start gap-3 pb-4"
              >
                <div
                  className={`relative z-10 h-6 w-6 rounded-full ${config.bgColor} flex items-center justify-center`}
                >
                  <div className={config.color}>{config.icon}</div>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{config.label}</p>
                    {changedByName && (
                      <span className="text-xs text-muted-foreground">
                        by {changedByName}
                      </span>
                    )}
                  </div>
                  {item.comment && (
                    <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1 wrap-break-word text-pretty">
                      <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                      {item.comment}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more/less */}
        {statusHistory.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:underline w-full text-center"
          >
            {isExpanded
              ? "Show less"
              : `Show ${statusHistory.length - 3} more updates`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact status badge for lists
export function StatusBadge({
  status,
  isUrgent,
  size = "default",
}: {
  status: string;
  isUrgent?: boolean;
  size?: "default" | "sm" | "lg";
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <div
      className={`flex items-center gap-1.5 ${size === "lg" ? "justify-center" : ""}`}
    >
      <Badge
        variant="outline"
        className={`${config.bgColor} ${config.color} border-0 
          ${size === "sm" ? "text-xs px-1.5 py-0" : ""} 
          ${size === "lg" ? "text-base px-4 py-1.5 font-semibold" : ""}
        `}
      >
        {size === "lg" ? (
          <div className="flex items-center gap-2">
            {config.icon}
            <span>{config.label}</span>
          </div>
        ) : (
          <>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </>
        )}
      </Badge>
      {isUrgent && (
        <Badge
          variant="destructive"
          className={
            size === "sm"
              ? "text-xs px-1.5 py-0"
              : size === "lg"
                ? "text-sm px-2 py-0.5"
                : ""
          }
        >
          <Flag className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
        </Badge>
      )}
    </div>
  );
}
