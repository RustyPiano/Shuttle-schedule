import type { ReactNode } from 'react';

interface NextBusCardProps {
    title: string;
    time: string;
    count: number;
    hint: string;
    note: ReactNode;
    after?: string;
    children: ReactNode;
}

// 做成车票样式：虚线上方是路线和日期，下方是班次；虚线两端的圆形缺口用页面背景色填充
export function NextBusCard({ title, time, count, hint, note, after, children }: NextBusCardProps) {
    return <section className="overflow-hidden rounded-3xl bg-(--line-soft) p-5">
        {children}
        <div className="relative my-5 border-t-2 border-dashed border-(--line)/25 before:absolute before:-top-[11px] before:-left-[30px] before:size-5 before:rounded-full before:bg-stone-100 after:absolute after:-top-[11px] after:-right-[30px] after:size-5 after:rounded-full after:bg-stone-100" />
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-(--line)">{title}</h2>
            {count > 1 && <span className="text-xs font-medium text-stone-600">{count} 辆同时发车</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            {time && <p className="text-6xl leading-none font-semibold tracking-tight tabular-nums text-stone-950">{time}</p>}
            {hint && <p className="rounded-full bg-(--line) px-3 py-1 text-sm font-semibold text-white">{hint}</p>}
        </div>
        {note && <div className="mt-4 space-y-3 text-sm text-stone-600">{note}</div>}
        {after && <p className="mt-1 text-sm text-stone-600">再下一班 <span className="font-semibold tabular-nums text-stone-900">{after}</span></p>}
    </section>;
}
