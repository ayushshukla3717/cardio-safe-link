import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage, addUserMessage, clearMessages } from '@/store/slices/chatbotSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Chatbot() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.chatbot);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    dispatch(addUserMessage(userMessage));
    try { await dispatch(sendMessage(userMessage)).unwrap(); } catch { toast.error('Failed to send'); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b"><div className="container mx-auto px-4 py-4 flex items-center justify-between"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold text-primary">Health Assistant</h1></div><Button variant="outline" size="icon" onClick={() => { dispatch(clearMessages()); toast.success('Chat cleared'); }}><Trash2 className="h-5 w-5" /></Button></div></header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col"><Card className="flex-1 flex flex-col"><CardHeader><CardTitle>Chat with AI</CardTitle></CardHeader><CardContent className="flex-1 flex flex-col"><div className="flex-1 overflow-y-auto mb-4 space-y-4">{messages.length === 0 ? <div className="text-center text-muted-foreground py-8"><p>Ask me health questions!</p></div> : messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-lg p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div></div>))}{loading && <div className="flex justify-start"><div className="bg-muted rounded-lg p-4"><p className="text-muted-foreground">Typing...</p></div></div>}<div ref={messagesEndRef} /></div><form onSubmit={handleSend} className="flex gap-2"><Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={loading} /><Button type="submit" disabled={loading}><Send className="h-4 w-4" /></Button></form></CardContent></Card></main>
    </div>
  );
}
