// components/NumericKeyboard.tsx
export const NumericKeyboard = ({
  onInput,
  onDelete,
  disabled,
}: {
  onInput: (val: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "DEL", "0"];

  return (
    <div className="grid grid-cols-3 gap-2 w-64 mt-4 mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() =>
            key === "DEL" ? onDelete() : onInput(key)
          }
          className="bg-gray-200 py-3 rounded text-lg font-semibold hover:bg-gray-300 transition"
          disabled={disabled}
        >
          {key === "DEL" ? "⌫" : key}
        </button>
      ))}
    </div>
  );
};
