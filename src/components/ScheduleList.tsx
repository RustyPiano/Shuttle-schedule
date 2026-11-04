import { ChevronDown } from 'lucide-react';
import { StopList } from './StopList';
import type { Departure, RouteType } from '../data';

interface ScheduleListProps {
    title: string;
    entries: Departure[];
    // entries 按时间排序，前 split 项已过发车时间
    split: number;
    live: boolean;
    isLoop: boolean;
    route: RouteType;
}

export function ScheduleList({ title, entries, split, live, isLoop, route }: ScheduleListProps) {
    // 环线班次多，按小时分行；一小时内的最后一班已过，这一行才算已过
    const rows = isLoop
        ? [...new Set(entries.map(entry => entry.time.slice(0, 2)))].map(hour => {
            const indexes = entries.flatMap((entry, index) => entry.time.startsWith(hour) ? [index] : []);
            return {
                past: indexes[indexes.length - 1] < split,
                node: <li key={hour} className="flex items-baseline gap-4 px-5 py-3">
                    <span className="w-6 shrink-0 text-sm font-semibold text-(--line) tabular-nums">{hour}</span>
                    <span className="flex flex-1 flex-wrap gap-x-5 gap-y-1 border-l border-stone-200 pl-4 text-xl font-medium tabular-nums">
                        {indexes.map(index => <span key={index} className={index < split ? 'text-stone-500' : index === split ? '-mx-2 rounded-full bg-(--line) px-2 text-white' : ''}>{entries[index].time.slice(3)}</span>)}
                    </span>
                </li>,
            };
        })
        : entries.map(({ time, buses }, index) => {
            const next = index === split;
            return {
                past: index < split,
                node: <li key={time} className={`relative flex items-start gap-4 px-5 py-4 ${next ? 'bg-(--line-soft)' : ''}`}>
                    {next && <span className="absolute inset-y-0 left-0 w-1 bg-(--line)" />}
                    <span className={`w-16 shrink-0 text-2xl font-medium tabular-nums ${index < split ? 'text-stone-500' : ''}`}>{time}{next && <span className="mt-1 block text-xs font-semibold text-(--line)">{live ? '下一班' : '查询结果'}</span>}</span>
                    <div className="min-w-0 flex-1 space-y-3">{buses.map(bus => <StopList key={bus.line} {...bus} route={route} time={time} />)}</div>
                </li>,
            };
        });
    const past = rows.filter(row => row.past);
    return <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200/70" aria-label={title}>
        <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold">{title}</h2>
            <span className="text-xs text-stone-500">共 {entries.reduce((sum, entry) => sum + entry.buses.reduce((total, bus) => total + bus.count, 0), 0)} 班</span>
        </div>
        {past.length > 0 && <details className="group border-y border-stone-100 bg-stone-50">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm text-stone-500">{live ? '已过发车时间' : '更早班次'}<ChevronDown className="size-4 group-open:rotate-180" /></summary>
            <ul className="divide-y divide-stone-100">{past.map(row => row.node)}</ul>
        </details>}
        <ul className="divide-y divide-stone-100">{rows.filter(row => !row.past).map(row => row.node)}</ul>
    </section>;
}
