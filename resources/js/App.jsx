import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import InputPage from './pages/InputPage';
import CalendarPage from './pages/CalendarPage';
import GraphPage from './pages/GraphPage';

const TABS = [
    { key: 'input',    label: '入力',       icon: '✏️' },
    { key: 'calendar', label: 'カレンダー', icon: '📅' },
    { key: 'graph',    label: 'グラフ',     icon: '📈' },
];

export default function App() {
    const [tab, setTab] = useState('input');
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/me')
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('auth_token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => setChecking(false));
        } else {
            setChecking(false);
        }
    }, []);

    const handleLogin = (user) => setUser(user);

    const handleLogout = async () => {
        await axios.post('/api/logout');
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    if (checking) return null;

    if (!user) return <LoginPage onLogin={handleLogin} />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <div className={`w-full flex-1 p-6 pb-32 ${tab === 'input' ? 'max-w-md' : 'max-w-4xl'}`}>
                {tab === 'input'    && <InputPage />}
                {tab === 'calendar' && <CalendarPage />}
                {tab === 'graph'    && <GraphPage />}
            </div>

            <nav className={`fixed bottom-8 w-full bg-white border border-gray-200 rounded-2xl shadow-lg mx-auto ${tab === 'input' ? 'max-w-md' : 'max-w-4xl'}`}>
                <div className="flex items-center">
                    {TABS.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition ${
                                tab === key ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="text-xl mb-1">{icon}</span>
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex flex-col items-center py-3 text-xs font-medium text-gray-400 hover:text-red-400 transition"
                    >
                        <span className="text-xl mb-1">🚪</span>
                        ログアウト
                    </button>
                </div>
            </nav>
        </div>
    );
}
