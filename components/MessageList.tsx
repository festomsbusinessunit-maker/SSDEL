import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
