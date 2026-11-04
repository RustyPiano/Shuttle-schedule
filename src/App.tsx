import { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowRight, Bus, Globe, Mail } from 'lucide-react';
import { NextBusCard } from './components/NextBusCard';
import { ScheduleList } from './components/ScheduleList';
import { Segmented } from './components/Segmented';
import { StopList } from './components/StopList';
import { getDepartures, getDayType, findFirstBusAfter, formatWait } from './data';
import type { Departure, RouteType, ServiceType } from './data';

const email = 'me@rustypiano.com';

function App() {
  const [service, setService] = useState<ServiceType>(() => {
    const saved = localStorage.getItem('bus-service');
    return saved === 'loop' || saved === 'loop1' ? saved : 'shuttle';
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteType>(() => localStorage.getItem('bus-direction') === 'route2' ? 'route2' : 'route1');
  const [pickedDate, setPickedDate] = useState<string>();
  const [pickedTime, setPickedTime] = useState<string>();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isLoop = service !== 'shuttle';
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const date = pickedDate ?? today;
  const time = pickedTime ?? (date === today ? now.toTimeString().slice(0, 5) : '00:00');
  const query = new Date(`${date}T${time}:00`);
  const live = pickedDate === undefined && pickedTime === undefined;
  const entries = getDepartures(service, selectedRoute, getDayType(query));
  const split = entries.filter(entry => entry.time < time).length;
  const [from, to] = selectedRoute === 'route1' ? ['三号院', '一号院'] : ['一号院', '三号院'];

  let card: Departure & { title: string; hint: string; after?: string };
  if (split < entries.length) {
    card = { title: live ? '下一班车' : '所选时间起的首班', ...entries[split], hint: live ? formatWait(entries[split].time, now) : '', after: entries[split + 1]?.time };
  } else {
    const first = findFirstBusAfter(service, selectedRoute, query);
    card = { title: entries.length === 0 ? (live ? '今日没有班次' : '当天没有班次') : (live ? '今日班车已结束' : '当天班车已结束'), ...first, hint: `${first.label}首班` };
  }

  const switchRoute = () => {
    const otherRoute = selectedRoute === 'route1' ? 'route2' : 'route1';
    setSelectedRoute(otherRoute);
    localStorage.setItem('bus-direction', otherRoute);
  };

  return (
    <main data-line={isLoop ? '环线' : '8号线'} className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-10">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-xl bg-(--line) text-white"><Bus className="size-4.5" /></span>
          校内班车
        </h1>
        <p className="text-sm font-medium text-stone-500">{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
      </header>
      <Segmented label="班车类型" value={service} onChange={value => { setService(value); localStorage.setItem('bus-service', value); }} options={[{ value: 'shuttle', label: '院际班车' }, { value: 'loop', label: '三号院环线' }, { value: 'loop1', label: '一号院环线' }]} />
      <NextBusCard {...card} count={card.buses.reduce((sum, bus) => sum + bus.count, 0)} note={!isLoop && card.buses.map(bus => <StopList key={bus.line} {...bus} route={selectedRoute} time={card.time} />)}>
        {isLoop
          ? <div className="flex items-baseline justify-between gap-3">
            <p className="text-xl font-bold">{service === 'loop' ? '三号院环线' : '一号院环线'}</p>
            <p className="text-xs text-stone-600">{service === 'loop' ? '2025年9月18日起执行' : '工作日运行'}</p>
          </div>
          : <div className="flex items-center gap-3">
            <p className="flex flex-1 items-center gap-2.5 text-xl font-bold">{from}<ArrowRight className="size-5 text-(--line)" strokeWidth={2.5} />{to}</p>
            <button aria-label="切换方向" onClick={switchRoute} className="grid size-10 place-items-center rounded-full bg-white text-(--line) shadow-sm"><ArrowLeftRight className="size-4.5" /></button>
          </div>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="min-w-0 text-xs text-stone-600">出发日期<input aria-label="出发日期" type="date" min={today} value={date} onChange={event => setPickedDate(event.target.value || undefined)} className="mt-1.5 block min-w-0 w-full rounded-xl border border-(--line)/15 bg-white px-3 py-2.5 text-base text-stone-900" /></label>
          <label className="min-w-0 text-xs text-stone-600">出发时间<input aria-label="出发时间" type="time" value={time} onChange={event => setPickedTime(event.target.value || undefined)} className="mt-1.5 block min-w-0 w-full rounded-xl border border-(--line)/15 bg-white px-3 py-2.5 text-base text-stone-900" /></label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-600">
          <p>{live ? '按当前时间自动更新' : '查找所选时间及之后的班次'}</p>
          {!live && <button onClick={() => { setPickedDate(undefined); setPickedTime(undefined); setNow(new Date()); }} className="shrink-0 rounded-full bg-white px-3 py-1.5 font-semibold text-(--line)">回到现在</button>}
        </div>
      </NextBusCard>
      <ScheduleList key={`${service}-${selectedRoute}-${date}`} title="发车时刻" entries={entries} split={split} live={live} isLoop={isLoop} route={selectedRoute} />
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
