
interface SelectTimeProps {
    value: number;
    onChange: (val: number) => void;
}

export function SelectTime({ value, onChange }: SelectTimeProps) {
    const options = [0, 30, 60, 90];
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">TLE Minutes</label>
            <div className="grid grid-cols-4 gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`py-3 rounded-lg font-semibold transition-all active:scale-95 ${value === opt
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
