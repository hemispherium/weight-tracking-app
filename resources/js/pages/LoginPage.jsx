import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/api/login' : '/api/register';
            const res = await axios.post(endpoint, form);
            const { token, user } = res.data;
            localStorage.setItem('auth_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            onLogin(user);
        } catch (e) {
            setErrors(e.response?.data?.errors ?? { email: ['ログインに失敗しました。'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {mode === 'login' ? 'ログイン' : 'アカウント登録'}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">名前</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">メールアドレス</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">パスワード</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">パスワード（確認）</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-4">
                    {mode === 'login' ? (
                        <>アカウントをお持ちでない方は
                            <button onClick={() => setMode('register')} className="text-blue-500 ml-1 hover:underline">登録</button>
                        </>
                    ) : (
                        <>すでにアカウントをお持ちの方は
                            <button onClick={() => setMode('login')} className="text-blue-500 ml-1 hover:underline">ログイン</button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
