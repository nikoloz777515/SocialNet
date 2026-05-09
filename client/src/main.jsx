import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GroupProvider } from './context/GroupContext.jsx';
import { PostProvider } from './context/PostContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider>
           <ChatProvider>
                <PostProvider>
                    <GroupProvider>
                        <App/>
                    </GroupProvider>
                </PostProvider>
           </ChatProvider>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);