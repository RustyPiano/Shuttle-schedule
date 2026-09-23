import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DateChips } from './components/DateChips';
import { RouteTabs } from './components/RouteTabs';
import { NextBusCard } from './components/NextBusCard';
import { ScheduleList } from './components/ScheduleList';
import { lines, stops, loopTimes, getTimes, getBusNote, groupTimes } from './data';
import type { DayType, LineType, RouteType } from './data';

function App() {
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedRoute, setSelectedRoute] = useState<RouteType>(() => localStorage.getItem('bus-direction') === 'route2' ? 'route2' : 'route1');
  const [selectedLine, setSelectedLine] = useState<LineType>(() => lines.find(line => line === localStorage.getItem('bus-line')) ?? '线路8');
  const [isLoop, setIsLoop] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const targetDate = new Date(now);
  if (selectedDate === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
  if (selectedDate === 'saturday') targetDate.setDate(targetDate.getDate() + (6 - now.getDay() + 7) % 7);
  if (selectedDate === 'sunday') targetDate.setDate(targetDate.getDate() + (7 - now.getDay()) % 7);
  const isToday = isLoop || targetDate.toDateString() === now.toDateString();
  const dayType: DayType = targetDate.getDay() === 0 ? 'sunday' : targetDate.getDay() === 6 ? 'saturday' : 'weekday';
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const times = isLoop ? loopTimes : getTimes(selectedLine, selectedRoute, dayType);
  const next = times ? groupTimes(times).find(entry => !isToday || entry.time >= currentTime) : undefined;
  const diffMinutes = next && isToday ? Number(next.time.slice(0, 2)) * 60 + Number(next.time.slice(3)) - now.getHours() * 60 - now.getMinutes() : null;
  const routeStops = stops[selectedLine]?.[selectedRoute];

  return (
    <div className="min-h-screen pb-8">
      <Header onRefresh={() => { setSelectedDate('today'); setNow(new Date()); }} currentTime={`${now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} ${currentTime}`} />
      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-1 bg-gray-200/70 rounded-xl p-1" aria-label="班车类型">
          {[false, true].map(loop => <button key={String(loop)} aria-pressed={isLoop === loop} onClick={() => setIsLoop(loop)} className={`rounded-lg py-3 text-sm font-semibold ${isLoop === loop ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}>{loop ? '三号院环线' : '院际班车'}</button>)}
        </div>
        {!isLoop && <>
          <div className="grid grid-cols-5 gap-2" aria-label="选择线路">
            {lines.map(line => <button key={line} aria-pressed={selectedLine === line} onClick={() => { setSelectedLine(line); localStorage.setItem('bus-line', line); }} className={`rounded-full py-2.5 text-sm font-medium ${selectedLine === line ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>{line}</button>)}
          </div>
          <RouteTabs selectedRoute={selectedRoute} onSelect={route => { setSelectedRoute(route); localStorage.setItem('bus-direction', route); }} />
          <div className="space-y-2">
            <DateChips selectedDate={selectedDate} onSelect={setSelectedDate} />
            <p className="text-xs text-gray-500">{targetDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
          {times ? <NextBusCard nextBus={next?.time ?? null} diffMinutes={diffMinutes} isToday={isToday} count={next?.count ?? 0} origin={routeStops?.[0]} note={next ? getBusNote(selectedLine, selectedRoute, next.time) : ''} /> : <div className="bg-white rounded-2xl p-6 text-center text-gray-600">暂无周末时刻表</div>}
          {routeStops && <details key={`${selectedLine}-${selectedRoute}`} className="rounded-2xl bg-white px-4">
            <summary className="py-4 text-sm font-medium cursor-pointer">停靠站点 <span className="text-gray-500 font-normal">· {routeStops.length} 站</span></summary>
            <ol className="space-y-3 pb-4" aria-label="停靠顺序">{routeStops.map((stop, index) => <li key={stop} className="flex gap-3 text-sm items-start"><span className="shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-800 text-xs grid place-items-center">{index + 1}</span><span className="pt-0.5">{stop}</span></li>)}</ol>
          </details>}
        </>}
        {isLoop && <>
          <NextBusCard nextBus={next?.time ?? null} diffMinutes={diffMinutes} isToday count={next?.count ?? 0} note="" />
          <div className="text-xs text-gray-600 space-y-1">
            <p>首班 07:30 · 末班 22:30</p>
            <p>运行日期请以校内通知为准</p>
          </div>
        </>}
        {times && <ScheduleList key={`${isLoop}-${selectedLine}-${selectedRoute}-${selectedDate}`} times={times} isToday={isToday} currentTime={currentTime} line={isLoop ? undefined : selectedLine} route={selectedRoute} />}
        {isLoop && <p className="text-center text-xs text-gray-500">2025年9月18日起执行</p>}
      </main>
    </div>
  );
}

export default App;
