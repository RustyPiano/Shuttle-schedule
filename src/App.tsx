import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Header } from './components/Header';
import { DateChips } from './components/DateChips';
import { RouteTabs } from './components/RouteTabs';
import { NextBusCard } from './components/NextBusCard';
import { ScheduleList } from './components/ScheduleList';
import { scheduleData } from './data';
import type { DayType, RouteType } from './data';

function App() {
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedRoute, setSelectedRoute] = useState<RouteType>('route1');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate target date based on selection
  const getTargetDate = () => {
    const target = new Date(now);
    if (selectedDate === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    } else if (selectedDate === 'saturday') {
      const day = now.getDay();
      const diff = (6 - day + 7) % 7;
      target.setDate(target.getDate() + (diff || 7));
      if (day === 6 && diff === 0) return now; // Keep today if it is Saturday
    } else if (selectedDate === 'sunday') {
      const day = now.getDay();
      const daysToAdd = day === 0 ? 0 : 7 - day;
      target.setDate(target.getDate() + daysToAdd);
    }
    return target;
  };

  const targetDate = getTargetDate();
  const isToday = targetDate.toDateString() === now.toDateString();

  const getDayType = (date: Date): DayType => {
    const day = date.getDay();
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekday';
  };

  const dayType = getDayType(targetDate);
  const times = scheduleData[dayType][selectedRoute];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Calculate next bus
  let nextBus: string | null = null;
  let diffMinutes: number | null = null;

  if (isToday) {
    const next = times.find(t => {
      const [h, m] = t.split(':').map(Number);
      return (h * 60 + m) >= currentMinutes;
    });
    if (next) {
      nextBus = next;
      const [h, m] = next.split(':').map(Number);
      diffMinutes = (h * 60 + m) - currentMinutes;
    }
  } else if (times.length > 0) {
    nextBus = times[0];
  }

  const handleRefresh = () => {
    setSelectedDate('today');
    setNow(new Date());
  };

  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="min-h-screen pb-safe">
      <Header onRefresh={handleRefresh} currentTime={`${dateStr} ${timeStr}`} />

      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        <DateChips selectedDate={selectedDate} onSelect={setSelectedDate} />
        <RouteTabs selectedRoute={selectedRoute} onSelect={setSelectedRoute} />

        <NextBusCard
          nextBus={nextBus}
          diffMinutes={diffMinutes}
          isToday={isToday}
        />

        <ScheduleList
          times={times}
          isToday={isToday}
          currentMinutes={currentMinutes}
        />

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            重要提示
          </h4>
          <ul className="space-y-1.5 text-xs text-blue-700/80 list-disc list-inside">
            <li>线路8在 <strong>17:00以后</strong> 的班次会途径科大佳园</li>
            <li>一号院内环线：7:30-12:30, 14:00-18:30</li>
            <li>三号院内环线：7:30-12:30, 14:00-18:30</li>
          </ul>
        </div>

        <div className="h-4"></div>
      </main>
    </div>
  );
}

export default App;
