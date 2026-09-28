import { ChevronDown } from 'lucide-react';

export function StopList({ stops }: { stops: string[] }) {
    return <details className="group rounded-3xl bg-white ring-1 ring-stone-200/70">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
            <span className="font-semibold">停靠站点<span className="ml-2 text-sm font-normal text-stone-500">{stops.length} 站</span></span>
            <ChevronDown className="size-4 text-stone-500 group-open:rotate-180" />
        </summary>
        <ol className="px-5 pb-5" aria-label="停靠顺序">
            {stops.map((stop, index) => {
                const end = index === 0 || index === stops.length - 1;
                // 竖线从本站圆点中心连到下一站圆点中心
                return <li key={stop} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    {index < stops.length - 1 && <span className="absolute top-2.5 -bottom-2.5 left-[7px] w-0.5 bg-(--line)" />}
                    <span className={`relative mt-0.5 size-4 shrink-0 rounded-full border-[3px] border-(--line) ${end ? 'bg-(--line)' : 'bg-white'}`} />
                    <span className={`text-sm ${end ? 'font-semibold' : ''}`}>{stop}</span>
                </li>;
            })}
        </ol>
    </details>;
}
