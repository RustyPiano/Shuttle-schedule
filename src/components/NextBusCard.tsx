import { Clock } from 'lucide-react';

interface NextBusCardProps {
    nextBus: string | null;
    diffMinutes: number | null;
    isToday: boolean;
}

export function NextBusCard({ nextBus, diffMinutes, isToday }: NextBusCardProps) {
    let statusText = '正在计算...';
    let timeRemainingText = '-- 分钟';
    let cardClass = 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/20';

    if (!isToday) {
        statusText = nextBus ? '该日首班车' : '该日无班次';
        timeRemainingText = '非今日';
        cardClass = nextBus ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gray-400';
    } else if (nextBus && diffMinutes !== null) {
        if (diffMinutes === 0) {
            statusText = '正在发车，请抓紧时间';
            timeRemainingText = '现在';
        } else if (diffMinutes < 60) {
            statusText = `距离下一班还有 ${diffMinutes} 分钟`;
            timeRemainingText = `${diffMinutes} 分钟`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const mins = diffMinutes % 60;
            statusText = `距离下一班还有 ${hours} 小时 ${mins} 分钟`;
            timeRemainingText = `${hours}小时${mins}分`;
        }

        if (diffMinutes <= 10) {
            cardClass = 'bg-gradient-to-br from-red-500 to-orange-600 shadow-orange-500/30';
        }
    } else {
        statusText = '今日班车已全部结束';
        timeRemainingText = '--';
        cardClass = 'bg-gray-400';
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl text-white shadow-lg p-5 transition-colors duration-500 ${cardClass}`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/5 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1">下一班车</p>
                        <h2 className="text-4xl font-bold tracking-tight">{nextBus || '--:--'}</h2>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-semibold">{timeRemainingText}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{statusText}</span>
                </div>
            </div>
        </div>
    );
}
