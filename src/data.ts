export type DayType = 'weekday' | 'saturday' | 'sunday';
export type RouteType = 'route1' | 'route2';

export const lines = ['线路8', '理学院', '系统', '空天', '气海', '环线'] as const;
export type LineType = typeof lines[number];

export const schedules: Record<Exclude<LineType, '环线'>, Partial<Record<DayType, Record<RouteType, string[]>>>> = {
    线路8: {
        weekday: {
            route1: ['07:50', '07:50', '07:50', '09:45', '10:00', '12:00', '12:00', '12:35', '13:45', '16:25', '16:25', '17:05', '17:30', '17:30', '17:55', '18:25', '21:00', '21:30', '21:35', '21:55', '22:15'],
            route2: ['07:10', '07:10', '07:20', '07:20', '07:30', '07:30', '07:30', '09:20', '09:20', '09:30', '11:25', '13:50', '14:00', '15:30', '16:25', '16:25', '18:55', '18:55', '21:00'],
        },
        saturday: {
            route1: ['07:50', '10:00', '12:00', '12:35', '16:25', '17:30', '18:25', '21:35', '22:15'],
            route2: ['07:20', '09:30', '13:50', '15:30', '18:55'],
        },
        sunday: {
            route1: ['12:35', '17:30', '22:15'],
            route2: ['07:20', '09:30', '13:50'],
        },
    },
    理学院: { weekday: { route1: ['09:45', '18:25', '20:20'], route2: ['07:20', '08:00', '11:25'] } },
    系统: { weekday: { route1: ['12:05', '17:50', '21:00'], route2: ['07:25', '14:00'] } },
    空天: { weekday: { route1: ['08:10', '17:45', '21:50'], route2: ['07:25', '16:30', '21:05'] } },
    气海: { weekday: { route1: ['07:30', '18:00', '20:30'], route2: ['08:30', '18:50', '21:10'] } },
};
export const stops: Partial<Record<LineType, Record<RouteType, string[]>>> = {
    理学院: {
        route1: ['理学院', '三号院南门', '科大佳园北苑南门', '北门东侧', '天河楼', '博士生楼', '俱乐部东侧', '主楼东侧'],
        route2: ['主楼东侧', '俱乐部东侧', '博士生楼', '天河楼', '北门东侧', '三号院南门', '305教学楼', '二食堂', '理学院'],
    },
    系统: {
        route1: ['新院楼南门', '二食堂强军大道口／科大佳园南苑东门', '原院楼前'],
        route2: ['原院楼前', '二食堂北侧', '新院楼南门'],
    },
    空天: {
        route1: ['高超楼', '激光所', '二食堂', '三号院南门', '科大佳园南苑东门', '一号院北门', '空天楼', '主楼东侧', '材料楼', '博士生楼西'],
        route2: ['空天楼', '主楼东侧', '材料楼', '博士生楼西', '一号院北门', '三号院南门', '二食堂', '激光所', '高超楼'],
    },
    气海: {
        route1: ['长望楼北侧广场', '海天实验楼', '科大佳园南苑东门', '天河楼', '科技楼', '海天楼'],
        route2: ['海天楼', '科技楼', '天河楼', '海天实验楼', '长望楼北侧广场'],
    },
};
// 按 Excel 原表逐行排列（第一班、第二班、第三班、夜1班、夜2班），使用时由 groupTimes 排序
export const loopTimes = [
    '07:30', '08:00', '08:36', '09:12', '09:48', '10:24', '11:00', '11:36', '12:15', '14:00', '14:36', '15:15', '16:24', '17:24',
    '07:40', '08:12', '08:48', '09:24', '10:00', '10:36', '11:12', '11:48', '12:25', '14:12', '14:48', '15:30', '16:36', '17:36',
    '07:50', '08:24', '09:00', '09:36', '10:12', '10:48', '11:24', '12:00', '12:40', '14:24', '15:00', '16:00', '17:00', '17:48',
    '15:45', '16:12', '16:48', '17:12', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
    '18:15', '18:45', '19:15', '19:45', '20:15', '20:45', '21:15', '21:45', '22:15',
];

export function getTimes(line: LineType, route: RouteType, day: DayType): string[] | null {
    if (line === '环线') return loopTimes;
    return schedules[line][day]?.[route] ?? null;
}
export function groupTimes(times: string[]) {
    const counts = new Map<string, number>();
    for (const time of times) counts.set(time, (counts.get(time) ?? 0) + 1);
    return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([time, count]) => ({ time, count }));
}
export function getBusNote(line: LineType, route: RouteType, time: string) {
    const origin = line === '理学院' && route === 'route2' && time === '08:00' ? '103教学楼' : stops[line]?.[route][0];
    let via = '';
    if (line === '系统' && route === 'route1') via = time === '12:05' ? '二食堂强军大道口' : '科大佳园南苑东门';
    if (line === '线路8' && time > '17:00') via = '科大佳园';
    return [origin && `${origin}发车`, via && `途经${via}`].filter(Boolean).join(' · ');
}
export function getDayType(date: Date): DayType {
    return date.getDay() === 0 ? 'sunday' : date.getDay() === 6 ? 'saturday' : 'weekday';
}
export function findFirstBusAfter(line: LineType, route: RouteType, date: Date) {
    for (let offset = 1; ; offset++) {
        const day = new Date(date);
        day.setDate(date.getDate() + offset);
        const times = getTimes(line, route, getDayType(day));
        if (times) {
            const { time, count } = groupTimes(times)[0];
            return { label: offset === 1 ? '明天' : day.toLocaleDateString('zh-CN', { weekday: 'short' }), time, count };
        }
    }
}
export function formatWait(time: string, now: Date) {
    const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) - now.getHours() * 60 - now.getMinutes();
    if (minutes === 0) return '到发车时间了';
    const hours = Math.floor(minutes / 60);
    return `${[hours && `${hours} 小时`, minutes % 60 && `${minutes % 60} 分钟`].filter(Boolean).join(' ')}后`;
}
