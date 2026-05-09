import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Send, Paperclip, MoreVertical, Users, Copy, Trash2, Edit3, X } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar";

const Chat = () => {
  const { user: currentUser } = useAuth();
  const { activeChat, messages, sendMessage, deleteMessageAction, editMessageAction } = useChat();
  const [content, setContent] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const scrollRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (editingMessage) {
        await editMessageAction(editingMessage._id, content);
        setEditingMessage(null);
      } else {
        await sendMessage(content);
      }
      setContent("");
    } catch (err) {
      console.error("Error handling submit:", err);
    }
  };

  const handleEditClick = (msg) => {
    setEditingMessage(msg);
    setContent(msg.content);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("content", ""); 
    formData.append("messageImage", file); 

    try {
      await sendMessage(formData);
      e.target.value = null; 
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] text-gray-500 italic">
        <Users size={48} className="mb-4 opacity-10" />
        <p className="uppercase tracking-widest text-xs font-black">აირჩიეთ ჩატი დასაწყებად</p>
      </div>
    );
  }

  const isGroup = activeChat.isGroup || (activeChat.members && activeChat.members.length > 2);
  const chatName = activeChat.fullname || activeChat.title || activeChat.name || "Chat";

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] h-full overflow-hidden relative border-l border-white/5">
      
      {/* HEADER */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={getAvatarUrl(activeChat.avatar)} 
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/20 shadow-lg shadow-indigo-500/10" 
              alt="avatar" 
            />
            {isGroup && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-lg p-0.5 border border-[#0f172a]">
                <Users size={10} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase italic leading-none tracking-tight">
              {chatName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
               <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGroup ? 'bg-indigo-400' : 'bg-green-500'}`}></span>
               <span className={`text-[9px] font-black tracking-widest uppercase ${isGroup ? 'text-indigo-400' : 'text-green-500'}`}>
                  {isGroup ? `${activeChat.members?.length || 0} Members` : "Online"}
               </span>
            </div>
          </div>
        </div>
        <MoreVertical size={20} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
        {messages.map((msg, idx) => {
          const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
          
          return (
            <div key={msg._id || idx} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && isGroup && (
                <span className="text-[10px] text-indigo-400 font-black uppercase italic mb-1 ml-1 tracking-tighter">
                  {msg.sender?.fullname || "Member"}
                </span>
              )}

              <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                <div className="invisible group-hover:visible flex items-center gap-1 bg-[#1e293b] border border-white/10 p-1 rounded-lg shadow-2xl shrink-0">
                  <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 text-gray-400 hover:text-white"><Copy size={14} /></button>
                  {isMe && (
                    <>
                      <button onClick={() => handleEditClick(msg)} className="p-1.5 text-gray-400 hover:text-indigo-400"><Edit3 size={14} /></button>
                      <button onClick={() => deleteMessageAction(msg._id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>

                <div className={`relative px-4 py-2.5 rounded-2xl shadow-lg ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"}`}>
                  {msg.messageImage && (
                    <div className="my-1 overflow-hidden rounded-xl border border-white/10">
                      <img 
                        src={`http://localhost:3000/uploads/messages/${msg.messageImage}`} 
                        className="max-w-full h-auto max-h-[350px] object-contain block" 
                        alt="attachment" 
                      />
                    </div>
                  )}
                  {msg.content && <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-medium">{msg.content}</p>}
                </div>
              </div>
              <div className={`text-[8px] mt-1.5 opacity-40 font-black px-2 uppercase tracking-tighter ${isMe ? "text-right" : "text-left"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-[#0f172a] border-t border-white/10 backdrop-blur-xl">
        {editingMessage && (
          <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 mb-3 rounded-xl border-l-4 border-indigo-500 animate-in slide-in-from-left duration-300">
            <p className="text-[10px] text-indigo-400 uppercase font-black italic">რედაქტირება...</p>
            <button onClick={() => {setEditingMessage(null); setContent("");}}><X size={16} className="text-white"/></button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          {!editingMessage && (
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all"><Paperclip size={22} /></button>
          )}
          <input 
            type="text" 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            placeholder={editingMessage ? "შეცვალე შეტყობინება..." : "დაწერე შეტყობინება..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-1 focus:ring-indigo-500/20 text-sm"
          />
          <button type="submit" disabled={!content.trim()} className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-20 active:scale-95 transition-all">
            {editingMessage ? <Edit3 size={22} /> : <Send size={22} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;