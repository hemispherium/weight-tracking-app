import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const EMOJIS = ['😊', '😐', '😢', '💪', '🔥', '😴', '🤒', '🎉'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function DateNavigator({ date, onChange }) {
    const d = parseLocalDate(date);
    const year = d.getFullYear();
    const month = MONTHS[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const dayOfWeek = DAYS[d.getDay()];

    const move = (delta) => {
        const next = new Date(d);
        next.setDate(next.getDate() + delta);
        onChange(formatDateStr(next));
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <button
                type="button"
                onClick={() => move(-1)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
            >
                &lt;
            </button>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{year}</span>
                <div className="text-2xl font-bold text-gray-800">
                    {month}.{day} {dayOfWeek}
                </div>
            </div>
            <button
                type="button"
                onClick={() => move(1)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
            >
                &gt;
            </button>
        </div>
    );
}

export default function InputPage() {
    const today = formatDateStr(new Date());
    const [form, setForm] = useState({
        date: today,
        weight: '',
        body_fat: '',
        emoji: '',
        memo: '',
    });
    const [showPicker, setShowPicker] = useState(false);
    const [message, setMessage] = useState(null);
    const [isExisting, setIsExisting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageLabel, setImageLabel] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setMessage(null);
        setImageFile(null);
        setImagePreview(null);
        setImageLabel('');
        axios.get('/api/weight-records', { params: { date: form.date } }).then((res) => {
            const record = res.data.find((r) => r.date === form.date);
            if (record) {
                setForm({
                    date: record.date,
                    weight: record.weight ?? '',
                    body_fat: record.body_fat ?? '',
                    emoji: record.emoji ?? '',
                    memo: record.memo ?? '',
                    image_url: record.image_url ?? '',
                });
                if (record.image_url) setImagePreview(record.image_url);
                setIsExisting(true);
            } else {
                setForm((prev) => ({ date: prev.date, weight: '', body_fat: '', emoji: '', memo: '', image_url: '' }));
                setIsExisting(false);
            }
        });
    }, [form.date]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadToCloudinary = async () => {
        const { data: sig } = await axios.get('/api/cloudinary/signature', {
            params: { date: form.date, weight: form.weight, label: imageLabel },
        });
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('api_key', sig.api_key);
        formData.append('timestamp', sig.timestamp);
        formData.append('signature', sig.signature);
        formData.append('public_id', sig.public_id);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
            { method: 'POST', body: formData }
        );
        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let image_url = form.image_url ?? '';
            if (imageFile) {
                image_url = await uploadToCloudinary();
            }
            await axios.post('/api/weight-records', { ...form, image_url });
            setMessage({ type: 'success', text: isExisting ? '更新しました！' : '記録しました！' });
            setIsExisting(true);
            setImageFile(null);
        } catch (e) {
            const errors = e.response?.data?.errors;
            const text = errors
                ? Object.values(errors).flat().join(' ')
                : '保存に失敗しました';
            setMessage({ type: 'error', text });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-8 w-full">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">体重記録</h1>
            <form onSubmit={handleSubmit} className="space-y-5">

                <DateNavigator
                    date={form.date}
                    onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">体重 (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        placeholder="例: 65.5"
                        step="0.1"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">体脂肪率 (%)</label>
                    <input
                        type="number"
                        name="body_fat"
                        value={form.body_fat}
                        onChange={handleChange}
                        placeholder="例: 20.0"
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">絵文字</label>
                    <div className="flex gap-2 flex-wrap items-center">
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setForm({ ...form, emoji })}
                                className={`text-2xl p-2 rounded-lg border-2 transition ${
                                    form.emoji === emoji
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {emoji}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowPicker((v) => !v)}
                            className={`text-sm px-3 py-2 rounded-lg border-2 transition ${
                                form.emoji && !EMOJIS.includes(form.emoji)
                                    ? 'border-blue-400 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-400 text-gray-500'
                            }`}
                        >
                            {form.emoji && !EMOJIS.includes(form.emoji)
                                ? <span className="text-2xl">{form.emoji}</span>
                                : '＋'}
                        </button>
                    </div>
                    {showPicker && (
                        <div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            onClick={() => setShowPicker(false)}
                        >
                            <div onClick={(e) => e.stopPropagation()}>
                                <EmojiPicker
                                    onEmojiClick={(e) => {
                                        setForm({ ...form, emoji: e.emoji });
                                        setShowPicker(false);
                                    }}
                                    width={450}
                                    height={500}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">メモ</label>
                    <textarea
                        name="memo"
                        value={form.memo}
                        onChange={handleChange}
                        placeholder="今日の体調など..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">画像</label>
                    <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="max-h-48 rounded-lg object-contain" />
                        ) : (
                            <span className="text-gray-400 text-sm">クリックして画像を選択</span>
                        )}
                    </label>
                    {imageFile && (
                        <div className="mt-2">
                            <label className="block text-xs text-gray-500 mb-1">ラベル（任意）</label>
                            <input
                                type="text"
                                value={imageLabel}
                                onChange={(e) => setImageLabel(e.target.value)}
                                placeholder="例: 朝食後"
                                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    )}
                    {imagePreview && (
                        <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); setImageLabel(''); setForm({ ...form, image_url: '' }); }}
                            className="mt-1 text-xs text-red-400 hover:underline"
                        >
                            画像を削除
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                    {uploading ? 'アップロード中...' : isExisting ? '更新する' : '記録する'}
                </button>

                {message && (
                    <p className={`text-center text-sm font-medium ${
                        message.type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {message.text}
                    </p>
                )}
            </form>
        </div>
    );
}
