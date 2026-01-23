import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Inbox, Star, Archive, Search, ChevronLeft, ChevronRight,
  Paperclip, Reply, Forward, Trash2, MoreVertical, X, User
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import Avatar from './Avatar';

const MessagingCenter = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Compose form
  const [composeData, setComposeData] = useState({
    recipient_id: '',
    recipient_type: '',
    subject: '',
    body: ''
  });
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [activeTab, page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
      const response = await api.get(`${endpoint}?page=${page}&limit=15`);
      setMessages(response.data.messages || []);
      setTotalPages(response.data.total_pages || 1);
      if (activeTab === 'inbox') {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load messages" });
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (threadId) => {
    try {
      const response = await api.get(`/messages/thread/${threadId}`);
      setThreadMessages(response.data.messages || []);
      setSelectedThread(threadId);
      fetchMessages(); // Refresh to update read status
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load thread" });
    }
  };

  const sendMessage = async () => {
    if (!composeData.recipient_id || !composeData.subject || !composeData.body) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all fields" });
      return;
    }

    try {
      await api.post('/messages', composeData);
      toast({ title: "Message sent!" });
      setShowCompose(false);
      setComposeData({ recipient_id: '', recipient_type: '', subject: '', body: '' });
      if (activeTab === 'sent') fetchMessages();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    }
  };

  const sendReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      await api.post(`/messages/${messageId}/reply`, { body: replyText });
      toast({ title: "Reply sent!" });
      setReplyText('');
      fetchThread(selectedThread);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send reply" });
    }
  };

  const toggleStar = async (messageId) => {
    try {
      const response = await api.put(`/messages/${messageId}/star`);
      setMessages(prev => prev.map(m => 
        m.message_id === messageId ? { ...m, is_starred_recipient: response.data.starred } : m
      ));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to star message" });
    }
  };

  const archiveMessage = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/archive`);
      toast({ title: "Message archived" });
      fetchMessages();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to archive message" });
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Messages
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-700">{unreadCount} unread</Badge>
              )}
            </CardTitle>
            <Button onClick={() => setShowCompose(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4 mr-2" /> Compose
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-1/3 border-r">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); setSelectedThread(null); }}>
                <TabsList className="w-full justify-start px-4 py-2 bg-gray-50">
                  <TabsTrigger value="inbox" className="data-[state=active]:bg-white">
                    <Inbox className="h-4 w-4 mr-1" /> Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="data-[state=active]:bg-white">
                    <Send className="h-4 w-4 mr-1" /> Sent
                  </TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Message List */}
                <div className="overflow-y-auto h-[450px]">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No messages</p>
                    </div>
                  ) : (
                    messages.filter(m => 
                      !search || m.subject?.toLowerCase().includes(search.toLowerCase())
                    ).map((message) => (
                      <div
                        key={message.message_id}
                        onClick={() => fetchThread(message.thread_id)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedThread === message.thread_id ? 'bg-indigo-50' : ''
                        } ${!message.is_read && activeTab === 'inbox' ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar 
                            name={activeTab === 'inbox' ? message.sender_name : message.recipient_name} 
                            size="sm" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm truncate ${!message.is_read && activeTab === 'inbox' ? 'font-semibold' : ''}`}>
                                {activeTab === 'inbox' ? message.sender_name : message.recipient_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${!message.is_read && activeTab === 'inbox' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {message.subject}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{message.body}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStar(message.message_id); }}
                            className="text-gray-300 hover:text-amber-400"
                          >
                            <Star className={`h-4 w-4 ${message.is_starred_recipient ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-2 border-t flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                    <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Tabs>
            </div>

            {/* Message View */}
            <div className="flex-1 flex flex-col">
              {selectedThread && threadMessages.length > 0 ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-lg">{threadMessages[0]?.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {threadMessages.length} message{threadMessages.length > 1 ? 's' : ''} in this conversation
                    </p>
                  </div>

                  {/* Thread Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {threadMessages.map((msg, idx) => (
                      <div key={msg.message_id} className="flex gap-3">
                        <Avatar name={msg.sender_name || 'User'} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{msg.sender_name || 'User'}</span>
                            <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3 text-sm whitespace-pre-wrap">
                            {msg.body}
                          </div>
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {msg.attachments.map((att, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <Paperclip className="h-3 w-3 mr-1" /> {att}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 border-t bg-gray-50">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedThread(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => sendReply(threadMessages[threadMessages.length - 1]?.message_id)}>
                        <Reply className="h-4 w-4 mr-2" /> Send Reply
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">New Message</h3>
              <button onClick={() => setShowCompose(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Recipient ID</label>
                  <Input
                    placeholder="User ID"
                    value={composeData.recipient_id}
                    onChange={(e) => setComposeData({ ...composeData, recipient_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Recipient Type</label>
                  <select
                    value={composeData.recipient_type}
                    onChange={(e) => setComposeData({ ...composeData, recipient_type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select type</option>
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Message subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Write your message..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={6}
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;
