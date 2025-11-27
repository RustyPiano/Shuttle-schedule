import { Bus, RefreshCw } from 'lucide-react';

interface HeaderProps {
    onRefresh: () => void;
    currentTime: string;
}

export function Header({ onRefresh, currentTime }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Bus className="w-5 h-5 text-primary-600" />
                        线路8 时刻表
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">{currentTime}</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
