import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTimes, groupTimes, getBusNote, loopTimes, weekdayLines, stops } from '../src/data.ts';

test('同一时刻保留车辆数量，两个方向独立统计', () => {
    assert.deepEqual(groupTimes(getTimes('线路8', 'route1', 'weekday'))[0], { time: '07:50', count: 3 });
    assert.equal(getTimes('线路8', 'route1', 'weekday').length, 21);
    assert.equal(getTimes('线路8', 'route2', 'weekday').length, 19);
    assert.equal(groupTimes(getTimes('线路8', 'route2', 'weekday')).find(entry => entry.time === '07:30').count, 3);
});

test('未知周末时刻与已知时刻分开处理', () => {
    assert.equal(getTimes('系统', 'route1', 'saturday'), null);
    assert.deepEqual(getTimes('线路8', 'route1', 'sunday'), ['12:35', '17:30', '22:15']);
});

test('环线时刻完整、有序，系统线路提醒随班次变化', () => {
    assert.equal(loopTimes.length, 65);
    assert.equal(new Set(loopTimes).size, 65);
    assert.equal(loopTimes[0], '07:30');
    assert.equal(loopTimes.at(-1), '22:30');
    assert.deepEqual(loopTimes, [...loopTimes].sort());
    assert.equal(getBusNote('系统', 'route1', '12:05'), '途经二食堂强军大道口');
    assert.equal(getBusNote('系统', 'route1', '17:50'), '途经科大佳园南苑东门');
    assert.equal(stops.系统.route1[0], '新院楼南门');
    for (const directions of Object.values(weekdayLines)) {
        for (const times of Object.values(directions)) {
            assert.deepEqual(times, [...times].sort());
            for (const time of times) assert.match(time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
        }
    }
});
