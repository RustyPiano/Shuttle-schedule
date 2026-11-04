import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lines, schedules, loopTimes, firstCampusLoopTimes, getTimes, groupTimes, getDepartures, getBusNote, findFirstBusAfter, formatWait } from '../src/data.ts';

test('同一时刻合并为一项，保留车辆数量并按时间排序', () => {
    assert.deepEqual(groupTimes(['08:00', '07:50', '07:50']), [{ time: '07:50', count: 2 }, { time: '08:00', count: 1 }]);
});

test('没有周末数据的线路在周末返回 null，环线不分日期', () => {
    assert.equal(getTimes('系统', 'route1', 'saturday'), null);
    assert.equal(getTimes('环线', 'route1', 'sunday'), loopTimes);
});

test('一号院环线按照片录入28班，仅工作日运行且不区分方向', () => {
    const expectedTimes = [
        '07:30', '07:46', '08:02', '08:18', '08:34', '08:50',
        '09:10', '09:35', '10:00', '10:25', '10:50', '11:10',
        '11:30', '11:50', '12:15', '14:00', '14:16', '14:32',
        '14:48', '15:04', '15:20', '15:45', '16:10', '16:35',
        '17:00', '17:20', '17:40', '18:00',
    ];
    assert.equal(expectedTimes.length, 28);
    for (const route of ['route1', 'route2']) {
        assert.deepEqual(getTimes('一号院环线', route, 'weekday'), expectedTimes);
        assert.deepEqual(getDepartures('loop1', route, 'weekday'), expectedTimes.map(time => ({ time, buses: [{ line: '一号院环线', count: 1 }] })));
        for (const day of ['saturday', 'sunday']) {
            assert.equal(getTimes('一号院环线', route, day), null);
            assert.deepEqual(getDepartures('loop1', route, day), []);
        }
    }
});

test('一号院环线在周五末班后和周末提示周一首班', () => {
    for (const date of [new Date(2026, 10, 6, 18, 1), new Date(2026, 10, 7, 8), new Date(2026, 10, 8, 8)]) {
        assert.deepEqual(findFirstBusAfter('loop1', 'route1', date), { label: '11月9日', time: '07:30', buses: [{ line: '一号院环线', count: 1 }] });
    }
    assert.deepEqual(findFirstBusAfter('loop1', 'route2', new Date(2026, 10, 9, 18, 1)), { label: '11月10日', time: '07:30', buses: [{ line: '一号院环线', count: 1 }] });
});

test('班次说明包含发车地点和途经站点', () => {
    assert.equal(getBusNote('理学院', 'route2', '08:00'), '主楼东侧发车');
    assert.equal(getBusNote('理学院', 'route2', '07:20'), '主楼东侧发车 · 途经103教学楼');
    assert.equal(getBusNote('气海', 'route2', '08:00'), '103教学楼发车');
    assert.equal(getBusNote('气海', 'route2', '08:30'), '海天楼发车');
    assert.equal(getBusNote('前沿', 'route2', '08:20'), '103教学楼发车');
    assert.equal(getBusNote('系统', 'route1', '12:05'), '新院楼南门发车 · 途经二食堂强军大道口');
    assert.equal(getBusNote('系统', 'route1', '17:50'), '新院楼南门发车 · 途经科大佳园南苑东门');
    assert.equal(getBusNote('8号线', 'route1', '17:30'), '途经科大佳园');
    assert.equal(getBusNote('8号线', 'route1', '12:00'), '');
});

test('理学院取消18:25班次，气海与前沿包含新增班次', () => {
    assert.deepEqual(getTimes('理学院', 'route1', 'weekday'), ['09:45', '20:20']);
    assert.deepEqual(getTimes('气海', 'route2', 'weekday'), ['08:00', '08:30', '18:50', '21:10']);
    assert.ok(lines.includes('前沿'));
    assert.deepEqual(getTimes('前沿', 'route2', 'weekday'), ['08:20']);
    assert.equal(getTimes('前沿', 'route1', 'weekday'), null);
    assert.equal(getTimes('前沿', 'route2', 'saturday'), null);
    assert.equal(getTimes('前沿', 'route2', 'sunday'), null);
});

test('当天没有剩余班次时找到下一个有班次的日子', () => {
    const fridayNight = new Date(2026, 8, 25, 23, 0);
    assert.deepEqual(findFirstBusAfter('shuttle', 'route1', fridayNight), { label: '9月26日', time: '07:50', buses: [{ line: '8号线', count: 1 }] });
    assert.deepEqual(findFirstBusAfter('shuttle', 'route2', new Date(2026, 8, 27, 23, 0)), { label: '9月28日', time: '07:10', buses: [{ line: '8号线', count: 2 }] });
    assert.deepEqual(findFirstBusAfter('loop', 'route2', fridayNight), { label: '9月26日', time: '07:30', buses: [{ line: '环线', count: 1 }] });
});

test('院际班车按时刻汇总各线路，同一时刻保留线路与车辆数量', () => {
    const departures = getDepartures('shuttle', 'route2', 'weekday');
    assert.deepEqual(departures[0], { time: '07:10', buses: [{ line: '8号线', count: 2 }] });
    assert.deepEqual(departures.find(entry => entry.time === '07:20').buses, [{ line: '8号线', count: 2 }, { line: '理学院', count: 1 }]);
    assert.deepEqual(departures.find(entry => entry.time === '07:25').buses, [{ line: '系统', count: 1 }, { line: '空天', count: 1 }]);
    assert.deepEqual(departures.find(entry => entry.time === '08:00').buses, [{ line: '理学院', count: 1 }, { line: '气海', count: 1 }]);
    assert.deepEqual(departures.find(entry => entry.time === '08:20').buses, [{ line: '前沿', count: 1 }]);
    assert.deepEqual(departures.map(entry => entry.time), departures.map(entry => entry.time).sort());
    const expectedCount = Object.values(schedules).reduce((sum, days) => sum + (days.weekday?.route2?.length ?? 0), 0);
    assert.equal(departures.reduce((sum, entry) => sum + entry.buses.reduce((total, bus) => total + bus.count, 0), 0), expectedCount);
    assert.ok(departures.every(entry => entry.buses.every(bus => Object.hasOwn(schedules, bus.line))));
});

test('周末汇总只包含当天有记录的班次，环线单独查询且不重复计算方向', () => {
    for (const day of ['saturday', 'sunday']) {
        const departures = getDepartures('shuttle', 'route2', day);
        assert.ok(departures.every(entry => entry.buses.every(bus => bus.line === '8号线')));
        assert.deepEqual(departures.map(entry => entry.time), schedules['8号线'][day].route2);
    }
    const loop = groupTimes(loopTimes).map(({ time, count }) => ({ time, buses: [{ line: '环线', count }] }));
    assert.deepEqual(getDepartures('loop', 'route1', 'weekday'), loop);
    assert.deepEqual(getDepartures('loop', 'route2', 'sunday'), loop);
    assert.ok(getDepartures('shuttle', 'route1', 'weekday').every(entry => entry.buses.every(bus => bus.line !== '前沿' && Object.hasOwn(schedules, bus.line))));
});

test('等待时间按小时和分钟显示', () => {
    const now = new Date(2026, 8, 29, 16, 15);
    assert.equal(formatWait('16:15', now), '到发车时间了');
    assert.equal(formatWait('16:40', now), '25 分钟后');
    assert.equal(formatWait('17:15', now), '1 小时后');
    assert.equal(formatWait('17:30', now), '1 小时 15 分钟后');
});

test('所有时刻都是两位数的 HH:MM', () => {
    const times = [...loopTimes, ...firstCampusLoopTimes, ...Object.values(schedules).flatMap(days => Object.values(days).flatMap(routes => Object.values(routes).flat()))];
    for (const time of times) assert.match(time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
});
