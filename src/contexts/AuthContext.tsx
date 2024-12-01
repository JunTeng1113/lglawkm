import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 先清除之前可能的登入狀態
      setUser(null);
      setIsAuthenticated(false);
      
      const result = await signInWithPopup(auth, provider);
      const { email, displayName, photoURL, uid } = result.user;
      
      // 檢查是否為允許的管理員郵箱
      const isAdmin = ['admin1@example.com', 'admin2@example.com', 'f113156101@nkust.edu.tw'].includes(email || '');
      if (!isAdmin) {
        await auth.signOut(); // 如果不是管理員，立即登出
        throw new Error('抱歉，您的郵箱帳號未被授權使用此系統');
      }

      const userData: User = {
        id: uid,
        email: email || '',
        name: displayName || '',
        picture: photoURL || '',
        role: isAdmin ? 'admin' : 'viewer',
        accessToken: await result.user.getIdToken()
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('登入失敗:', error);
      // 根據不同錯誤類型提供更具體的錯誤訊息
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('登入視窗被關閉，請重試');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('登入請求已取消，請重試');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('登入視窗被瀏覽器阻擋，請允許彈出視窗後重試');
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // 檢查存儲的用戶是否為管理員
      const isAdmin = ['admin1@example.com', 'admin2@example.com', 'F113156101@nkust.edu.tw'].includes(userData.email);
      if (isAdmin) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // 如果不是管理員，清除存儲的數據
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 