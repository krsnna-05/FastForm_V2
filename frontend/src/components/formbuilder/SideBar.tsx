import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageAvatar,
} from "../ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "../ai-elements/prompt-input";
import { Sparkles, Wand2 } from "lucide-react";
import type { UIMessage } from "ai";

type SideBarProps = {
  messages?: UIMessage[];
  onSend: (message: string, req: "create" | "edit") => void;
  isLoading?: boolean;
  formId?: string | null;
};

const SideBar = ({
  messages = [],
  onSend,
  isLoading = false,
  formId,
}: SideBarProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmedText = message.text?.trim();
    if (!trimmedText) {
      return;
    }

    if (!formId) {
      return;
    }

    onSend(trimmedText, "edit");
    setText("");
  };

  return (
    <div className="h-full w-full md:w-sm border-r border-border p-5 flex flex-col gap-4">
      <div className="max-h-[725px] h-full min-h-0 rounded-lg border border-border/50 bg-card/50 overflow-hidden flex flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Wand2 className="size-8" />}
                title="Create Your Form with AI"
                description="Tell me what kind of form you need, and I'll build it for you instantly. Be as specific as you'd like!"
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageAvatar role={message.role} />
                  <MessageContent isUser={message.role === "user"}>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div>
        <PromptInput
          onSubmit={handleSubmit}
          className="border-2 border-border/50 rounded-xl shadow-lg transition-all focus-within:border-primary/50 focus-within:shadow-xl"
          globalDrop
          multiple
        >
          <PromptInputHeader className="border-b border-border/50 bg-muted/30 h-10 flex items-center justify-between gap-3 px-3">
            <AIStatus state={isLoading ? "processing" : "available"} />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              placeholder="E.g., Add a phone number field..."
              className="min-h-[100px] text-sm resize-none border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </PromptInputBody>
          <PromptInputFooter className="border-t border-border bg-muted/30 px-4 py-3">
            <PromptInputSubmit
              disabled={!text || isLoading}
              className="gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="h-4 w-4" />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

const AIStatus = ({
  state,
  description,
}: {
  state: "available" | "processing";
  description?: string;
}) => {
  if (state === "available") {
    return (
      <div className="flex items-center gap-2 text-green-500 text-xs">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        AI is ready to assist you!
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="flex items-center gap-2 text-yellow-500 text-xs">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        {description || "AI is processing your request..."}
      </div>
    );
  }

  return null;
};

export default SideBar;
