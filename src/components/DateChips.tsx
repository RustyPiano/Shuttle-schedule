interface DateChipsProps {
    selectedDate: string;
    onSelect: (date: string) => void;
}

export function DateChips({ selectedDate, onSelect }: DateChipsProps) {
    const chips = [
        { id: 'today', label: '今天' },
        { id: 'tomorrow', label: '明天' },
        { id: 'saturday', label: '周六' },
        { id: 'sunday', label: '周日' }
    ];

    return (
        <div className="grid grid-cols-4 gap-2" aria-label="选择日期">
            {chips.map(chip => (
                <button
                    key={chip.id}
                    onClick={() => onSelect(chip.id)}
                    aria-pressed={selectedDate === chip.id}
                    className={`whitespace-nowrap py-2.5 rounded-full text-sm font-medium transition-colors ${selectedDate === chip.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    {chip.label}
                </button>
            ))}
        </div>
    );
}
