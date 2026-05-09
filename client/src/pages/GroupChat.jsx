import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Send, Image as ImageIcon, X, Users, Shield, MoreVertical, Copy, Edit3, Trash2 } from 'lucide-react';
import { getAvatarUrl } from "../utils/avatar";

const GroupChat = () => {
    const { activeChat, messages, sendMessage, deleteMessageAction, editMessageAction } = useChat();
    const { user } = useAuth();

    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showMembers, setShowMembers] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !file) return;

        try {
            if (editingMessage) {
                await editMessageAction(editingMessage._id, input);
                setEditingMessage(null);
            } else {
                let content = input;
                if (file) {
                    const formData = new FormData();
                    formData.append('content', input.trim());
                    formData.append('messageImage', file);
                    content = formData;
                }
                await sendMessage(content);
            }
            setInput("");
            setFile(null);
            setPreview(null);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleEditClick = (msg) => {
        setEditingMessage(msg);
        setInput(msg.content);
        setFile(null);
        setPreview(null);
    };

    if (!activeChat) return null;

    const chatTitle = activeChat.title || activeChat.name || "Group Chat";

    return (
        <div className="flex h-full w-full bg-[#0f172a] overflow-hidden">
            <div className="flex flex-col h-full transition-all duration-300 flex-1 border-r border-white/5">

                {/* HEADER */}
                <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <img
                            src={getAvatarUrl(activeChat.avatar)}
                            className="w-10 h-10 rounded-xl object-cover border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                            alt="group-avatar"
                        />
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase italic leading-none tracking-tight">
                                {chatTitle}
                            </h3>
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="flex items-center gap-1 text-[10px] text-indigo-400 font-black tracking-widest uppercase mt-1.5 hover:text-indigo-300 transition-all active:scale-95"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse mr-1 ${showMembers ? 'bg-indigo-400' : 'bg-green-500'}`}></span>
                                {showMembers ? "Close Members" : `${activeChat.members?.length || 0} Members`}
                            </button>
                        </div>
                    </div>
                    <MoreVertical size={20} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                        return (
                            <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <p className="text-[10px] text-indigo-400 mb-1 font-black uppercase italic tracking-tighter">
                                        {msg.sender?.fullname || "Member"}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 group max-w-[85%]">
                                   
                                    <div className={`invisible group-hover:visible flex gap-1 bg-[#1e293b] p-1 rounded-lg border border-white/10 ${isMe ? 'order-first' : 'order-last'}`}>
                                        <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1 text-gray-400 hover:text-white"><Copy size={12} /></button>
                                        {isMe && (
                                            <>
                                                <button onClick={() => handleEditClick(msg)} className="p-1 text-gray-400 hover:text-indigo-400"><Edit3 size={12} /></button>
                                                <button onClick={() => deleteMessageAction(msg._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                            </>
                                        )}
                                    </div>

                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                        {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                                        {msg.messageImage && (
                                            <img
                                                src={`http://localhost:3000/uploads/messages/${msg.messageImage}`}
                                                className="rounded-lg mt-2 max-w-full border border-white/5 shadow-md"
                                                alt="attached"
                                            />
                                        )}
                                        <div className="text-[8px] mt-1 opacity-40 font-bold text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-black/20 backdrop-blur-lg border-t border-white/10">
                    {editingMessage && (
                        <div className="flex justify-between items-center bg-indigo-500/10 p-2 mb-2 rounded-lg border-l-4 border-indigo-500">
                            <p className="text-[10px] text-indigo-400 uppercase font-black">რედაქტირება...</p>
                            <button onClick={() => { setEditingMessage(null); setInput(""); }}><X size={14} className="text-white" /></button>
                        </div>
                    )}
                    {preview && (
                        <div className="relative w-20 h-20 mb-3">
                            <img src={preview} className="w-full h-full object-cover rounded-xl border-2 border-indigo-500" alt="preview" />
                            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        {!editingMessage && (
                            <label className="cursor-pointer p-2 hover:bg-white/10 rounded-full">
                                <ImageIcon className="text-indigo-400" size={22} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const f = e.target.files[0];
                                    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                                }} />
                            </label>
                        )}
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="დაწერე შეტყობინება..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm"
                        />
                        <button onClick={handleSend} disabled={!input.trim() && !file} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white disabled:opacity-50">
                            {editingMessage ? <Edit3 size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupChat;