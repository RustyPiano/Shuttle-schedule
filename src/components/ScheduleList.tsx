import { groupTimes, getBusNote } from '../data';
import type { LineType, RouteType } from '../data';

interface ScheduleListProps {
    times: string[];
    isToday: boolean;
    currentTime: string;
    line?: LineType;
    route: RouteType;
}

export function ScheduleList({ times, isToday, currentTime, line, route }: ScheduleListProps) {
    const entries = groupTimes(times);
    const past = isToday ? entries.filter(entry => entry.time < currentTime) : [];
    const upcoming = isToday ? entries.filter(entry => entry.time >= currentTime) : entries;
    const renderRows = (rows: typeof entries, elapsed: boolean) => rows.map(({ time, count }, index) => {
        const next = isToday && !elapsed && index === 0;
        const note = line ? getBusNote(line, route, time) : '';
        return <li key={time} className={`px-4 py-3 flex items-center justify-between gap-3 ${next ? 'bg-primary-50' : ''} ${elapsed ? 'text-gray-500' : ''}`}>
            <div>
                <div className="flex items-center gap-3">
                    <span className={`text-xl tabular-nums font-semibold ${next ? 'text-primary-800' : ''}`}>{time}</span>
                    {count > 1 && <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1">{count} 辆</span>}
                </div>
                {note && <p className="text-xs text-gray-600 mt-1">{note}</p>}
            </div>
            {next && <span className="text-xs text-primary-800 font-medium">下一班</span>}
        </li>;
    });
    return <section className="bg-white rounded-2xl overflow-hidden shadow-sm" aria-label="发车时刻">
        <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="font-semibold">发车时刻</h2>
            <span className="text-xs text-gray-500">共 {times.length} 班</span>
        </div>
        {past.length > 0 && <details className="bg-gray-50">
            <summary className="px-4 py-3 text-sm text-gray-600 cursor-pointer">已过发车时间</summary>
            <ul className="divide-y divide-gray-100">{renderRows(past, true)}</ul>
        </details>}
        <ul className="divide-y divide-gray-100">{renderRows(upcoming, false)}</ul>
    </section>;
}
