import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import axios from 'axios';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);

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
        });
    }, []);

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
        </div>
    );
}
