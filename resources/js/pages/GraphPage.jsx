import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

function getMondayOf(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function GraphPage() {
    const [records, setRecords] = useState([]);
    const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));

    useEffect(() => {
        axios.get('/api/weight-records').then((res) => {
            setRecords(res.data);
        });
    }, []);

    const moveWeek = (delta) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + delta * 7);
        setWeekStart(d);
    };

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const recordMap = {};
    records.forEach((r) => { recordMap[r.date] = r; });

    const labels = weekDates.map((d) => {
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const dow = DAYS[d.getDay()];
        return `${m}/${day}(${dow})`;
    });

    const weights = weekDates.map((d) => {
        const r = recordMap[formatDate(d)];
        return r ? parseFloat(r.weight) : null;
    });

    const bodyFats = weekDates.map((d) => {
        const r = recordMap[formatDate(d)];
        return r && r.body_fat != null ? parseFloat(r.body_fat) : null;
    });

    const hasData = weights.some((w) => w !== null) || bodyFats.some((v) => v !== null);

    const calcRange = (values, padding = 1) => {
        const filtered = values.filter((v) => v !== null);
        if (!filtered.length) return { min: 0, max: 100 };
        return {
            min: Math.min(...filtered) - padding,
            max: Math.max(...filtered) + padding,
        };
    };

    const weightRange = calcRange(weights);
    const bodyFatRange = calcRange(bodyFats);

    const data = {
        labels,
        datasets: [
            {
                label: '体重',
                data: weights,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                pointBackgroundColor: weights.map((w) => w !== null ? 'rgb(59, 130, 246)' : 'transparent'),
                pointRadius: weights.map((w) => (w !== null ? 5 : 0)),
                tension: 0.3,
                fill: true,
                spanGaps: true,
                yAxisID: 'yWeight',
            },
            {
                label: '体脂肪率',
                data: bodyFats,
                borderColor: 'rgb(251, 146, 60)',
                backgroundColor: 'rgba(251, 146, 60, 0.05)',
                pointBackgroundColor: bodyFats.map((v) => v !== null ? 'rgb(251, 146, 60)' : 'transparent'),
                pointRadius: bodyFats.map((v) => (v !== null ? 5 : 0)),
                tension: 0.3,
                fill: false,
                spanGaps: true,
                yAxisID: 'yBodyFat',
            },
        ],
    };

    const options = {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { usePointStyle: true, pointStyle: 'circle' },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        if (ctx.parsed.y === null) return '';
                        return ctx.dataset.label === '体重'
                            ? ` 体重: ${ctx.parsed.y} kg`
                            : ` 体脂肪率: ${ctx.parsed.y} %`;
                    },
                },
            },
        },
        scales: {
            yWeight: {
                type: 'linear',
                position: 'left',
                min: weightRange.min,
                max: weightRange.max,
                ticks: { color: 'rgb(59, 130, 246)', callback: (v) => `${v} kg` },
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
            yBodyFat: {
                type: 'linear',
                position: 'right',
                min: bodyFatRange.min,
                max: bodyFatRange.max,
                ticks: { color: 'rgb(251, 146, 60)', callback: (v) => `${v} %` },
                grid: { drawOnChartArea: false },
            },
        },
    };

    const weekLabel = `${weekStart.getFullYear()}/${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    const weekEnd = weekDates[6];
    const weekEndLabel = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

    return (
        <div className="bg-white rounded-2xl shadow p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => moveWeek(-1)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
                >
                    &lt;
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{weekStart.getFullYear()}</span>
                    <span className="text-lg font-bold text-gray-800">
                        {weekStart.getMonth() + 1}/{weekStart.getDate()} - {weekEndLabel}
                    </span>
                </div>
                <button
                    onClick={() => moveWeek(1)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
                >
                    &gt;
                </button>
            </div>

            {hasData ? (
                <Line data={data} options={options} />
            ) : (
                <p className="text-center text-gray-400 mt-16">この週の記録がありません</p>
            )}
        </div>
    );
}
