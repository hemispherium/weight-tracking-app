import React, { useState } from 'react';
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <div className={`w-full flex-1 p-6 pb-32 ${tab === 'input' ? 'max-w-md' : 'max-w-4xl'}`}>
                {tab === 'input'    && <InputPage />}
                {tab === 'calendar' && <CalendarPage />}
                {tab === 'graph'    && <GraphPage />}
            </div>

            <nav className={`fixed bottom-8 w-full bg-white border border-gray-200 rounded-2xl shadow-lg mx-auto ${tab === 'input' ? 'max-w-md' : 'max-w-4xl'}`}>
                <div className="flex">
                    {TABS.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition ${
                                tab === key
                                    ? 'text-blue-500'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="text-xl mb-1">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
