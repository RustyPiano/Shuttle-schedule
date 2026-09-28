import { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowRight, Bus, Globe, Mail } from 'lucide-react';
import { NextBusCard } from './components/NextBusCard';
import { ScheduleList } from './components/ScheduleList';
import { Segmented } from './components/Segmented';
import { StopList } from './components/StopList';
import { lines, stops, getTimes, groupTimes, getBusNote, getDayType, findFirstBusAfter, formatWait } from './data';
import type { DayType, LineType, RouteType } from './data';

const dayLabels: Record<DayType, string> = { weekday: '工作日', saturday: '周六', sunday: '周日' };
const email = 'me@rustypiano.com';

function App() {
  const [selectedLine, setSelectedLine] = useState<LineType>(() => lines.find(line => line === localStorage.getItem('bus-line')) ?? '线路8');
  const [selectedRoute, setSelectedRoute] = useState<RouteType>(() => localStorage.getItem('bus-direction') === 'route2' ? 'route2' : 'route1');
  const [pickedDay, setPickedDay] = useState<DayType>();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isLoop = selectedLine === '环线';
  const todayType = getDayType(now);
  const showDays = !isLoop && getTimes(selectedLine, selectedRoute, 'saturday') !== null;
  const day = showDays ? pickedDay ?? todayType : todayType;
  // times 为 null：今天是周末，这条线路没有周末时刻表，列表改为显示工作日时刻
  const times = getTimes(selectedLine, selectedRoute, day);
  const live = day === todayType && times !== null;
  const entries = groupTimes(times ?? getTimes(selectedLine, selectedRoute, 'weekday')!);
  const currentTime = now.toTimeString().slice(0, 5);
  const split = live ? entries.filter(entry => entry.time < currentTime).length : 0;
  const routeStops = stops[selectedLine]?.[selectedRoute];
  const [from, to] = selectedRoute === 'route1' ? ['三号院', '一号院'] : ['一号院', '三号院'];

  let card: { title: string; time: string; count: number; hint: string; after?: string };
  if (live && split < entries.length) {
    card = { title: '下一班车', ...entries[split], hint: formatWait(entries[split].time, now), after: entries[split + 1]?.time };
  } else if (!live && times) {
    card = { title: `${dayLabels[day]}首班`, ...entries[0], hint: '' };
  } else {
    const first = findFirstBusAfter(selectedLine, selectedRoute, now);
    card = { title: times ? '今日班车已结束' : '暂无周末时刻表', time: first.time, count: first.count, hint: `${first.label}首班` };
  }

  const switchRoute = () => {
    const route = selectedRoute === 'route1' ? 'route2' : 'route1';
    setSelectedRoute(route);
    localStorage.setItem('bus-direction', route);
  };

  return (
    <main data-line={selectedLine} className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-10">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-xl bg-(--line) text-white"><Bus className="size-4.5" /></span>
          校内班车
        </h1>
        <p className="text-sm font-medium text-stone-500">{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
      </header>
      <div role="group" aria-label="线路" className="grid grid-cols-6 gap-1.5">
        {lines.map(line => {
          const selected = selectedLine === line;
          return <button key={line} data-line={line} aria-pressed={selected} onClick={() => { setSelectedLine(line); localStorage.setItem('bus-line', line); }} className={`rounded-2xl pt-2.5 pb-2 text-sm font-semibold ${selected ? 'bg-(--line) text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200/70'}`}>
            <span className={`mx-auto mb-1.5 block h-1 w-4 rounded-full ${selected ? 'bg-white/80' : 'bg-(--line)'}`} />
            {line}
          </button>;
        })}
      </div>
      <NextBusCard {...card} note={getBusNote(selectedLine, selectedRoute, card.time)}>
        {isLoop
          ? <div className="flex items-baseline justify-between gap-3">
            <p className="text-xl font-bold">三号院环线</p>
            <p className="text-xs text-stone-600">2025年9月18日起执行</p>
          </div>
          : <div className="flex items-center gap-3">
            <p className="flex flex-1 items-center gap-2.5 text-xl font-bold">{from}<ArrowRight className="size-5 text-(--line)" strokeWidth={2.5} />{to}</p>
            <button aria-label="切换方向" onClick={switchRoute} className="grid size-10 place-items-center rounded-full bg-white text-(--line) shadow-sm"><ArrowLeftRight className="size-4.5" /></button>
          </div>}
        {showDays && <div className="mt-4"><Segmented label="日期" value={day} onChange={setPickedDay} options={(['weekday', 'saturday', 'sunday'] as const).map(value => ({ value, label: value === todayType ? '今天' : dayLabels[value] }))} /></div>}
      </NextBusCard>
      <ScheduleList key={`${selectedLine}-${selectedRoute}-${day}`} title={times ? '发车时刻' : '工作日发车时刻'} entries={entries} split={split} live={live} line={selectedLine} route={selectedRoute} />
      {routeStops && <StopList key={`${selectedLine}-${selectedRoute}`} stops={routeStops} />}
      <footer className="rounded-3xl bg-white p-5 ring-1 ring-stone-200/70">
        <h2 className="font-semibold">反馈与更新</h2>
        <p className="mt-1 text-sm text-stone-500">时刻有变化或发现错误，欢迎联系我</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`mailto:${email}?subject=${encodeURIComponent('班车时刻表反馈')}`} className="flex items-center justify-center gap-2 rounded-full bg-(--line) py-2.5 text-sm font-semibold text-white"><Mail className="size-4" />发邮件</a>
          <a href="https://www.rustypiano.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-stone-100 py-2.5 text-sm font-semibold text-stone-700"><Globe className="size-4" />个人主页</a>
        </div>
        {/* 微信等内置浏览器打不开 mailto 链接，显示地址方便复制；select-all 让点一下就选中整个地址 */}
        <p className="mt-3 text-center text-xs text-stone-500 select-all">{email}</p>
      </footer>
    </main>
  );
}

export default App;
