interface StatesMultiProps {
  label: string;
  allStates: string[];
  selected: string[];
  onChange: (s: string[]) => void;
}

const StatesMulti: React.FC<StatesMultiProps> = ({ label, allStates, selected, onChange }) => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">{label}</label>
      <select
        multiple
        value={selected}
        onChange={(e) => {
          const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(opts);
        }}
        className="border rounded-md p-2 text-sm h-32"
      >
        {allStates.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatesMulti;
