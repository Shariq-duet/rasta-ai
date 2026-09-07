import { cn } from '@/lib/cn'

export function ChatBubble({ message }) {
  const isUser = message.from === 'user'
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed animate-slide-up',
        isUser
          ? 'self-end rounded-br-md bg-brand-600 text-white'
          : 'self-start rounded-bl-md bg-brand-50 text-ink',
      )}
    >
      {message.text}
    </div>
  )
}
