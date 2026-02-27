import { Search, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Filter, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react'

const Table = ({
    title,
    columns,
    data,
    onSearch,
    searchTerm,
    renderRow,
    actions,
    sortConfig,
    onSort,
    selectedIds,
    onSelectAll,
    onSelectRow,
    onFilter,
    primarySortKey,
    pagination = { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, onPageChange: () => { } }
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${title}...`}
                            value={searchTerm}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-blue-100 rounded-full text-sm text-gray-600 focus:outline-none focus:border-primary-500 w-64"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearch && onSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {onSort && (
                        <button
                            onClick={() => {
                                const key = primarySortKey || columns.find(col => col.sortable)?.accessor
                                if (key) onSort(key)
                            }}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors cursor-pointer
                                ${sortConfig?.key === (primarySortKey || columns.find(col => col.sortable)?.accessor)
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'border-blue-100 text-gray-600 hover:bg-gray-50 hover:border-blue-200'}
                            `}
                        >
                            {sortConfig?.key === (primarySortKey || columns.find(col => col.sortable)?.accessor) && sortConfig.direction === 'desc'
                                ? <ArrowDown size={16} />
                                : <ArrowUp size={16} />
                            }
                            {sortConfig?.key === (primarySortKey || columns.find(col => col.sortable)?.accessor) && sortConfig.direction === 'desc'
                                ? 'Z-A'
                                : 'A-Z'
                            }
                        </button>
                    )}

                    {onFilter && (
                        <button
                            onClick={onFilter}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-100 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-200 transition-colors"
                        >
                            <Filter size={16} />
                            Filters
                        </button>
                    )}

                    {actions}
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-orange-50/50">
                            {/* Checkbox Header */}
                            {onSelectAll && (
                                <th className="px-6 py-4 text-left w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        checked={data.length > 0 && selectedIds?.length === data.length}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                    />
                                </th>
                            )}
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-orange-100/50 transition-colors"
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && onSort && onSort(col.accessor)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && (
                                            sortConfig?.key === col.accessor
                                                ? (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-indigo-600" /> : <ArrowDown size={12} className="text-indigo-600" />)
                                                : <ArrowUpDown size={12} className="text-gray-400" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={item.id || index} className={`hover:bg-gray-50/80 transition-colors ${selectedIds?.includes(item.id) ? 'bg-indigo-50/30' : ''}`}>
                                    {/* Checkbox Row */}
                                    {onSelectRow && (
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                                checked={selectedIds?.includes(item.id)}
                                                onChange={() => onSelectRow(item.id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 text-sm text-gray-600">
                                            {col.render ? col.render(item) : item[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {renderRow ? renderRow(item) : (
                                                <>
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (onSelectAll ? 2 : 1)} className="px-6 py-12 text-center text-gray-500">
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results
                </p>

                <div className="flex items-center gap-2">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            // Simple pagination logic for now
                            let pageNum = i + 1;
                            if (pagination.totalPages > 5 && pagination.currentPage > 3) {
                                pageNum = pagination.currentPage - 2 + i;
                                // Adjust if near end
                                if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => pagination.onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.currentPage === pageNum
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Table
