interface SegmentedProps<T extends string> {
    label: string;
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
    return <div role="group" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-(--line)/10 p-1">
        {options.map(option => <button key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`rounded-full py-2 text-sm font-semibold ${value === option.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>{option.label}</button>)}
    </div>;
}
