import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schedules, loopTimes, getTimes, groupTimes, getBusNote, findFirstBusAfter, formatWait } from '../src/data.ts';

test('同一时刻合并为一项，保留车辆数量并按时间排序', () => {
    assert.deepEqual(groupTimes(['08:00', '07:50', '07:50']), [{ time: '07:50', count: 2 }, { time: '08:00', count: 1 }]);
});

test('没有周末数据的线路在周末返回 null，环线不分日期', () => {
    assert.equal(getTimes('系统', 'route1', 'saturday'), null);
    assert.equal(getTimes('环线', 'route1', 'sunday'), loopTimes);
});

test('班次说明包含发车地点和途经站点', () => {
    assert.equal(getBusNote('理学院', 'route2', '08:00'), '103教学楼发车');
    assert.equal(getBusNote('理学院', 'route2', '07:20'), '主楼东侧发车');
    assert.equal(getBusNote('系统', 'route1', '12:05'), '新院楼南门发车 · 途经二食堂强军大道口');
    assert.equal(getBusNote('系统', 'route1', '17:50'), '新院楼南门发车 · 途经科大佳园南苑东门');
    assert.equal(getBusNote('线路8', 'route1', '17:30'), '途经科大佳园');
    assert.equal(getBusNote('线路8', 'route1', '12:00'), '');
});

test('当天没有剩余班次时找到下一个有班次的日子', () => {
    const fridayNight = new Date(2026, 8, 25, 23, 0);
    assert.deepEqual(findFirstBusAfter('线路8', 'route1', fridayNight), { label: '明天', ...groupTimes(schedules.线路8.saturday.route1)[0] });
    assert.deepEqual(findFirstBusAfter('理学院', 'route2', fridayNight), { label: '周一', ...groupTimes(schedules.理学院.weekday.route2)[0] });
});

test('等待时间按小时和分钟显示', () => {
    const now = new Date(2026, 8, 29, 16, 15);
    assert.equal(formatWait('16:15', now), '到发车时间了');
    assert.equal(formatWait('16:40', now), '25 分钟后');
    assert.equal(formatWait('17:15', now), '1 小时后');
    assert.equal(formatWait('17:30', now), '1 小时 15 分钟后');
});

test('所有时刻都是两位数的 HH:MM', () => {
    const times = [...loopTimes, ...Object.values(schedules).flatMap(days => Object.values(days).flatMap(routes => Object.values(routes).flat()))];
    for (const time of times) assert.match(time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
});
