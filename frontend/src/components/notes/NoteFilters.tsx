interface NoteFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export default function NoteFilters({
  status,
  onStatusChange,
}: NoteFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Status:</label>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <option value="all">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
    </div>
  );
}
