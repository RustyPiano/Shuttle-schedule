interface NextBusCardProps {
    nextBus: string | null;
    diffMinutes: number | null;
    isToday: boolean;
    count: number;
    note: string;
    origin?: string;
}

export function NextBusCard({ nextBus, diffMinutes, isToday, count, note, origin }: NextBusCardProps) {
    return <section className="rounded-2xl bg-primary-700 p-5 text-white" aria-label="下一班车">
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">{isToday ? '下一班车' : '当日首班'}</h2>
            {count > 1 && <span className="text-xs">{count} 辆同时发车</span>}
        </div>
        {nextBus ? <>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-2">
                <p className="text-4xl font-bold tabular-nums tracking-tight">{nextBus}</p>
                {diffMinutes !== null && <p className="text-sm font-medium">{diffMinutes === 0 ? '到发车时间了' : `${diffMinutes} 分钟后`}</p>}
            </div>
            {(origin || note) && <p className="text-sm mt-3">{origin ? `${origin}发车` : ''}{origin && note ? ' · ' : ''}{note}</p>}
        </> : <p className="text-xl font-semibold mt-3">{isToday ? '今日班车已结束' : '当日无班次'}</p>}
    </section>;
}
