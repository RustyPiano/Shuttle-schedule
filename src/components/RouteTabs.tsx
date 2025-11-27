import type { RouteType } from '../data';

interface RouteTabsProps {
    selectedRoute: RouteType;
    onSelect: (route: RouteType) => void;
}

export function RouteTabs({ selectedRoute, onSelect }: RouteTabsProps) {
    const isRoute1 = selectedRoute === 'route1';

    return (
        <div className="bg-gray-200/60 p-1 rounded-xl flex relative">
            <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isRoute1 ? 'translate-x-0 left-1' : 'translate-x-full left-0' // Adjusted logic slightly for simplicity
                    }`}
                style={{ transform: isRoute1 ? 'translateX(0)' : 'translateX(100%)', left: isRoute1 ? '4px' : '0px' }}
            ></div>
            <button
                onClick={() => onSelect('route1')}
                className={`flex-1 relative z-10 py-2 text-sm font-medium text-center rounded-lg transition-colors duration-200 ${isRoute1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                三号院 → 一号院
            </button>
            <button
                onClick={() => onSelect('route2')}
                className={`flex-1 relative z-10 py-2 text-sm font-medium text-center rounded-lg transition-colors duration-200 ${!isRoute1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                一号院 → 三号院
            </button>
        </div>
    );
}
