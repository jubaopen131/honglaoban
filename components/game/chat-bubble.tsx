import { cn } from "@/lib/utils"
import { BossAvatar } from "./boss-avatar"
import { UserAvatar } from "./user-avatar"

interface ChatBubbleProps {
  message: {
    sender: "user" | "boss"
    text: string
  }
  animate?: boolean
}

export const ChatBubble = ({ message, animate = false }: ChatBubbleProps) => {
  const isUser = message.sender === "user"
  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-4 w-full",
        isUser ? "justify-end" : "justify-start",
        animate && "animate-fadeIn",
      )}
      style={animate ? { animationDelay: "0.1s" } : {}}
    >
      {!isUser && <BossAvatar className="self-start shrink-0" />}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl shadow",
          isUser ? "bg-brand-primary text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none",
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
      </div>
      {isUser && <UserAvatar className="self-start shrink-0" />}
    </div>
  )
}
