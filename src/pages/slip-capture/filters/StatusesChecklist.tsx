import { STATUS_KEYS, StatusKey } from "../types";

interface StatusesChecklistProps {
  selected: StatusKey[];
  onToggle: (k: StatusKey) => void;
}

const StatusesChecklist: React.FC<StatusesChecklistProps> = ({ selected, onToggle }) => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">Statuses</label>
      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-1 border rounded-md">
        {STATUS_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-1">
            <input type="checkbox" checked={selected.includes(k)} onChange={() => onToggle(k)} />
            {k}
          </label>
        ))}
      </div>
    </div>
  );
};

export default StatusesChecklist;
