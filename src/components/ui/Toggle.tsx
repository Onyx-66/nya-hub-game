interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Custom animated toggle switch.
 * 52×28px track, 22px white knob with shadow, smooth slide.
 * Off = gray-600, On = primary.
 */
export default function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-[52px] h-7 rounded-full shrink-0 transition-colors duration-300 ${
        checked ? "bg-primary" : "bg-gray-600"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-md transition-transform duration-300 ease-out"
        style={{ transform: checked ? "translateX(24px)" : "translateX(0)" }}
      />
    </button>
  );
}