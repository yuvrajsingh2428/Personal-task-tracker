
import { cn } from "@/lib/utils";

interface CheckboxRowProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function CheckboxRow({ label, checked, onChange }: CheckboxRowProps) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={cn(
                "flex items-center justify-between p-4 mb-3 rounded-xl border transition-all cursor-pointer active:scale-95 select-none",
                checked
                    ? "bg-green-50 border-green-200 text-green-900 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
            )}
        >
            <span className="font-medium text-lg">{label}</span>
            <div className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                checked ? "bg-green-600 border-green-600" : "border-gray-300"
            )}>
                {checked && (
                    <svg className="w-4 h-4 text-white" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                )}
            </div>
        </div>
    );
}
