interface LoanFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function LoanFilters({ currentFilter, onFilterChange }: LoanFiltersProps) {
  const filters = [
    { key: 'all', label: 'All Loans', color: 'cyan' },
    { key: 'pending', label: 'Pending', color: 'yellow' },
    { key: 'active', label: 'Active', color: 'blue' },
    { key: 'rejected', label: 'Rejected', color: 'red' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentFilter === filter.key
              ? `bg-${filter.color}-600 text-white`
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
} 