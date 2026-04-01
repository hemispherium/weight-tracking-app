import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import axios from 'axios';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [imageMap, setImageMap] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const modalImageRef = useRef(null);
    modalImageRef.current = setModalImage;

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        axios.get('/api/weight-records').then((res) => {
            const mapped = res.data.map((record) => ({
                date: record.date,
                title: '',
                extendedProps: {
                    weight: record.weight,
                    emoji: record.emoji,
                },
            }));
            setEvents(mapped);

            const imgMap = {};
            res.data.forEach((record) => {
                if (record.image_url) imgMap[record.date] = record.image_url;
            });
            setImageMap(imgMap);
        });
    }, []);

    if (imageMap === null) return null;

    return (
        <div className="bg-white rounded-2xl shadow p-6 w-full min-h-[600px]">
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                locale={jaLocale}
                headerToolbar={{
                    left: 'prev',
                    center: 'title',
                    right: 'next',
                }}
                height={600}
                events={events}
                dayCellDidMount={(arg) => {
                    const dateStr = formatDate(arg.date);
                    const imageUrl = imageMap[dateStr];
                    if (!imageUrl) return;

                    const btn = document.createElement('button');
                    btn.textContent = '📷';
                    btn.style.cssText = [
                        'position:absolute',
                        'top:7px',
                        'left:7px',
                        'font-size:13px',
                        'line-height:1',
                        'background:none',
                        'border:none',
                        'padding:0',
                        'cursor:pointer',
                        'z-index:10',
                    ].join(';');
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        modalImageRef.current(imageUrl);
                    });
                    arg.el.style.position = 'relative';
                    arg.el.appendChild(btn);
                }}
                eventContent={(arg) => {
                    const { weight, emoji } = arg.event.extendedProps;
                    return (
                        <div className="flex flex-col items-center w-full text-center leading-tight py-0.5">
                            {emoji && <span className="text-base">{emoji}</span>}
                            {weight && <span className="text-xs font-medium text-gray-700">{weight}kg</span>}
                        </div>
                    );
                }}
            />

            {modalImage && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setModalImage(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-4 max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={modalImage}
                            alt="記録画像"
                            className="w-full rounded-lg object-contain max-h-[70vh]"
                        />
                        <button
                            onClick={() => setModalImage(null)}
                            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
