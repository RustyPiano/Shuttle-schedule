import { ChevronDown } from 'lucide-react';
import { getBusNote, stops } from '../data';
import type { LineType, RouteType } from '../data';

export function StopList({ line, route, time, count }: { line: LineType; route: RouteType; time: string; count: number }) {
    const routeStops = stops[line]?.[route];
    const note = getBusNote(line, route, time);
    const description = <>
        <span className="flex items-center gap-2">
            <span data-line={line} className="rounded-full bg-(--line-soft) px-2 py-0.5 text-xs font-semibold text-(--line)">{line}</span>
            {count > 1 && <span className="text-xs text-stone-500">{count} 辆</span>}
            {routeStops && <span className="ml-auto flex items-center gap-1 text-xs text-stone-500">站点<ChevronDown className="size-3.5 group-open/stops:rotate-180" /></span>}
        </span>
        {note && <span className="mt-1 block text-xs leading-relaxed text-stone-600">{note}</span>}
    </>;

    if (!routeStops) return <div>{description}</div>;

    return <details className="group/stops min-w-0">
        <summary className="cursor-pointer rounded-lg" aria-label={`${line}班次，查看常规停靠站点`}>{description}</summary>
        <p className="mt-3 text-xs text-stone-500">常规停靠站点</p>
        <ol className="pt-3" aria-label={`${line}常规停靠顺序`}>
            {routeStops.map((stop, index) => {
                const end = index === 0 || index === routeStops.length - 1;
                // 竖线从本站圆点中心连到下一站圆点中心
                return <li key={stop} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    {index < routeStops.length - 1 && <span className="absolute top-2.5 -bottom-2.5 left-[7px] w-0.5 bg-(--line)" />}
                    <span className={`relative mt-0.5 size-4 shrink-0 rounded-full border-[3px] border-(--line) ${end ? 'bg-(--line)' : 'bg-white'}`} />
                    <span className={`text-sm ${end ? 'font-semibold' : ''}`}>{stop}</span>
                </li>;
            })}
        </ol>
    </details>;
}
