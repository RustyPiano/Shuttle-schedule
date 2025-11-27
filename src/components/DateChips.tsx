interface DateChipsProps {
    selectedDate: string;
    onSelect: (date: string) => void;
}

export function DateChips({ selectedDate, onSelect }: DateChipsProps) {
    const chips = [
        { id: 'today', label: '今天' },
        { id: 'tomorrow', label: '明天' },
        { id: 'saturday', label: '本周六' },
        { id: 'sunday', label: '本周日' }
    ];

    return (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {chips.map(chip => (
                <button
                    key={chip.id}
                    onClick={() => onSelect(chip.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedDate === chip.id
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {chip.label}
                </button>
            ))}
        </div>
    );
}
