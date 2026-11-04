import { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowRight, Bus, Globe, Mail } from 'lucide-react';
import { NextBusCard } from './components/NextBusCard';
import { ScheduleList } from './components/ScheduleList';
import { Segmented } from './components/Segmented';
import { StopList } from './components/StopList';
import { getDepartures, getDayType, getPresetDate, findFirstBusAfter, formatWait } from './data';
import type { DatePreset, Departure, RouteType, ServiceType } from './data';

const email = 'me@rustypiano.com';

function App() {
  const [service, setService] = useState<ServiceType>(() => {
    const saved = localStorage.getItem('bus-service');
    return saved === 'loop' || saved === 'loop1' ? saved : 'shuttle';
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteType>(() => localStorage.getItem('bus-direction') === 'route2' ? 'route2' : 'route1');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [pickedTime, setPickedTime] = useState<string>();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isLoop = service !== 'shuttle';
  const today = getPresetDate('today', now);
  const date = getPresetDate(datePreset, now);
  const time = pickedTime ?? (date === today ? now.toTimeString().slice(0, 5) : '00:00');
  const query = new Date(`${date}T${time}:00`);
  const live = date === today && pickedTime === undefined;
  const dayType = getDayType(query);
  const unconfirmed = dayType === 'holiday' || dayType === 'unknown';
  const entries = getDepartures(service, selectedRoute, dayType);
  const split = entries.filter(entry => entry.time < time).length;
  const [from, to] = selectedRoute === 'route1' ? ['三号院', '一号院'] : ['一号院', '三号院'];

  let card: Departure & { title: string; hint: string; after?: string };
  if (unconfirmed) {
    card = { title: '班车安排待确认', time: '', buses: [], hint: dayType === 'holiday' ? '节假日期间，请查看学校通知' : '该年份的节假日资料尚未收录' };
  } else if (split < entries.length) {
    card = { title: live ? '下一班车' : '所选时间起的首班', ...entries[split], hint: live ? formatWait(entries[split].time, now) : '', after: entries[split + 1]?.time };
  } else {
    const first = findFirstBusAfter(service, selectedRoute, query);
    card = { title: entries.length === 0 ? (live ? '今日没有班次' : '当天没有班次') : (live ? '今日班车已结束' : '当天班车已结束'), ...first, hint: first.time ? `${first.label}首班` : `${first.label}班车安排待确认` };
  }

  const switchRoute = () => {
    const otherRoute = selectedRoute === 'route1' ? 'route2' : 'route1';
    setSelectedRoute(otherRoute);
    localStorage.setItem('bus-direction', otherRoute);
  };

  return (
    <main data-line={isLoop ? '环线' : '8号线'} className={`mx-auto grid max-w-md items-start gap-4 px-4 pt-4 pb-10 ${!unconfirmed ? 'lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-6' : ''}`}>
      <header className="flex items-center justify-between lg:col-span-full">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-stone-200 text-stone-700"><Bus className="size-4.5" strokeWidth={1.5} /></span>
          校内班车
        </h1>
        <p className="text-sm font-medium text-stone-500">{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
      </header>
      <Segmented label="班车类型" value={service} onChange={value => { setService(value); localStorage.setItem('bus-service', value); }} options={[{ value: 'shuttle', label: '院际班车' }, { value: 'loop', label: '三号院环线' }, { value: 'loop1', label: '一号院环线' }]} />
      <NextBusCard {...card} count={card.buses.reduce((sum, bus) => sum + bus.count, 0)} note={!isLoop && card.buses.map(bus => <StopList key={bus.line} {...bus} route={selectedRoute} time={card.time} />)}>
        {isLoop
          ? <div className="flex items-baseline justify-between gap-3">
            <p className="text-xl font-semibold">{service === 'loop' ? '三号院环线' : '一号院环线'}</p>
            <p className="text-xs text-stone-600">{service === 'loop' ? '2025年9月18日起执行' : '工作日运行'}</p>
          </div>
          : <div className="flex items-center gap-3">
            <p className="flex flex-1 items-center gap-2.5 text-xl font-semibold">{from}<ArrowRight className="size-4.5 text-stone-500" strokeWidth={1.5} />{to}</p>
            <button aria-label="切换方向" onClick={switchRoute} className="grid size-10 place-items-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300"><ArrowLeftRight className="size-4.5" strokeWidth={1.5} /></button>
          </div>}
        <div className="mt-5">
          <Segmented label="出发日期" value={datePreset} onChange={value => { setDatePreset(value); setPickedTime(undefined); setNow(new Date()); }} options={[{ value: 'today', label: '今天' }, { value: 'tomorrow', label: '明天' }, { value: 'saturday', label: '周六' }, { value: 'sunday', label: '周日' }]} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="whitespace-nowrap text-sm text-stone-600">{query.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-stone-600">出发时间<input aria-label="出发时间" type="time" value={time} onChange={event => setPickedTime(event.target.value || undefined)} className="min-w-0 w-28 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-base text-stone-900 hover:border-stone-400" /></label>
        </div>
        {dayType === 'weekday' && (query.getDay() === 0 || query.getDay() === 6) && <p className="mt-3 text-xs text-stone-600">调休上班日，按工作日时刻表查询</p>}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-600">
          <p>{live ? '按当前时间自动更新' : '查找所选时间及之后的班次'}</p>
          {!live && <button onClick={() => { setDatePreset('today'); setPickedTime(undefined); setNow(new Date()); }} className="shrink-0 rounded-lg bg-stone-100 px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-200 active:bg-stone-300">回到现在</button>}
        </div>
      </NextBusCard>
      {!unconfirmed && <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:row-span-3"><ScheduleList key={`${service}-${selectedRoute}-${date}`} title="发车时刻" entries={entries} split={split} live={live} isLoop={isLoop} route={selectedRoute} /></div>}
      <footer className="rounded-2xl bg-white p-5 ring-1 ring-stone-200/70 lg:col-start-1">
        <h2 className="font-semibold">反馈与更新</h2>
        <p className="mt-1 text-sm text-stone-500">时刻有变化或发现错误，欢迎联系我</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`mailto:${email}?subject=${encodeURIComponent('班车时刻表反馈')}`} className="flex items-center justify-center gap-2 rounded-lg bg-stone-100 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-200 active:bg-stone-300"><Mail className="size-4.5" strokeWidth={1.5} />发邮件</a>
          <a href="https://www.rustypiano.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-stone-100 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-200 active:bg-stone-300"><Globe className="size-4.5" strokeWidth={1.5} />个人主页</a>
        </div>
        {/* 微信等内置浏览器打不开 mailto 链接，显示地址方便复制；select-all 让点一下就选中整个地址 */}
        <p className="mt-3 text-center text-xs text-stone-500 select-all">{email}</p>
      </footer>
    </main>
  );
}

export default App;
