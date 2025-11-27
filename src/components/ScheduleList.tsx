import { useEffect } from 'react';
import { Check, Clock, List } from 'lucide-react';

interface ScheduleListProps {
    times: string[];
    isToday: boolean;
    currentMinutes: number;
}

export function ScheduleList({ times, isToday, currentMinutes }: ScheduleListProps) {
    useEffect(() => {
        if (isToday) {
            setTimeout(() => {
                const nextEl = document.getElementById('nextBusItem');
                if (nextEl) {
                    nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [times, isToday]);

    let foundNext = false;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <List className="w-4 h-4 text-gray-400" />
                    全部班次
                </h3>
                <span className="text-xs text-gray-400">{times.length} 班</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto scroll-smooth">
                {times.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">今日无班次</div>
                ) : (
                    times.map((time) => {
                        const [h, m] = time.split(':').map(Number);
                        const timeMinutes = h * 60 + m;

                        let status: 'future' | 'next' | 'past' = 'future';

                        if (isToday) {
                            if (timeMinutes < currentMinutes) {
                                status = 'past';
                            } else if (!foundNext) {
                                status = 'next';
                                foundNext = true;
                            }
                        }

                        let containerClass = 'px-4 py-3 flex justify-between items-center transition-colors ';
                        let timeClass = 'text-lg font-mono font-medium ';
                        let statusClass = 'text-xs px-2 py-0.5 rounded ';

                        if (status === 'past') {
                            containerClass += 'bg-gray-50/50 text-gray-400';
                            timeClass += 'text-gray-400';
                            statusClass += 'bg-gray-100 text-gray-400';
                        } else if (status === 'next') {
                            containerClass += 'bg-primary-50 border-l-4 border-primary-500';
                            timeClass += 'text-primary-700 font-bold';
                            statusClass += 'bg-primary-100 text-primary-700 font-semibold';
                        } else {
                            containerClass += 'hover:bg-gray-50';
                            timeClass += 'text-gray-700';
                            statusClass += 'bg-gray-100 text-gray-600';
                        }

                        return (
                            <div key={time} className={containerClass} id={status === 'next' ? 'nextBusItem' : undefined}>
                                <div className="flex items-center gap-3">
                                    {status === 'past' && <Check className="w-4 h-4 opacity-50" />}
                                    {status === 'next' && <Clock className="w-4 h-4 text-primary-500 animate-pulse" />}
                                    {status === 'future' && <div className="w-4"></div>}
                                    <span className={timeClass}>{time}</span>
                                </div>
                                <div className={statusClass}>
                                    {status === 'past' ? '已发车' : (status === 'next' ? '即将发车' : '等待中')}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
