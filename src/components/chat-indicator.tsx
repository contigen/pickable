export function ChatIndicator() {
  return (
    <div className='flex items-center space-x-1 p-4 bg-[#0230470D] rounded-ee-none rounded-2xl w-fit'>
      <span className='sr-only'>Loading...</span>
      <div className='flex space-x-1'>
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className='size-2 rounded-full bg-muted-foreground animate-bounce'
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
