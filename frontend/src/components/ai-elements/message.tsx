"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, MessageCircle, Sparkles, User } from "lucide-react";

export type MessageProps = ComponentProps<"div"> & {
  from?: "user" | "assistant" | "system";
};

export const Message = ({
  className,
  from = "assistant",
  ...props
}: MessageProps) => (
  <div
    className={cn("flex gap-3", from === "user" && "justify-end", className)}
    {...props}
  />
);

export type MessageContentProps = ComponentProps<"div"> & {
  isUser?: boolean;
};

export const MessageContent = ({
  className,
  isUser = false,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg p-3",
      isUser
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export type MessageResponseProps = ComponentProps<"div">;

export const MessageResponse = ({
  className,
  ...props
}: MessageResponseProps) => (
  <div className={cn("text-sm leading-relaxed", className)} {...props} />
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  role?: "user" | "assistant" | "system";
};

export const MessageAvatar = ({
  role = "assistant",
  ...props
}: MessageAvatarProps) => (
  <Avatar {...props}>
    <AvatarFallback className="flex items-center justify-center">
      {role === "user" ? (
        <User className="h-4 w-4" />
      ) : (
        <Building2 className="h-4 w-4" />
      )}
    </AvatarFallback>
  </Avatar>
);
