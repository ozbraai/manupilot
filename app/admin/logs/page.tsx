'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Calendar, Filter, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';

type LogEntry = {
    id: string;
    created_at: string;
    log_type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    user_id?: string;
    project_id?: string;
    supplier_id?: string;
    error_type?: string;
    message: string;
    metadata: any;
    user?: { id: string; email: string } | null;
    project?: { id: string; name: string } | null;
};

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);

    // Filters
    const [logType, setLogType] = useState('all');
    const [severity, setSeverity] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(0);
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

    const limit = 50;

    useEffect(() => {
        fetchLogs();
    }, [logType, severity, startDate, endDate, page]);

    async function fetchLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (logType !== 'all') params.set('log_type', logType);
            if (severity) params.set('severity', severity);
            if (startDate) params.set('start_date', startDate);
            if (endDate) params.set('end_date', endDate);
            params.set('limit', limit.toString());
            params.set('offset', (page * limit).toString());

            const res = await fetch(`/api/admin/logs?${params}`);
            const data = await res.json();

            if (data.logs) {
                setLogs(data.logs);
                setCount(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleDownloadCSV() {
        const params = new URLSearchParams();
        if (logType !== 'all') params.set('log_type', logType);
        if (severity) params.set('severity', severity);
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);

        window.location.href = `/api/admin/logs/export?${params}`;
    }

    function toggleExpanded(logId: string) {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId);
        } else {
            newExpanded.add(logId);
        }
        setExpandedLogs(newExpanded);
    }

    function clearFilters() {
        setLogType('all');
        setSeverity('');
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setPage(0);
    }

    const filteredLogs = logs.filter(log =>
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const logTypes = [
        { value: 'all', label: 'All Logs' },
        { value: 'error', label: 'Errors' },
        { value: 'supplier_action', label: 'Supplier Actions' },
        { value: 'project_action', label: 'Project Actions' },
        { value: 'rfq_generation', label: 'RFQ Generation' },
        { value: 'ai_call', label: 'AI Calls' },
    ];

    const severityBadge = (sev: string) => {
        const colors = {
            info: 'bg-blue-100 text-blue-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800',
            critical: 'bg-purple-100 text-purple-800',
        };
        return colors[sev as keyof typeof colors] || colors.info;
    };

    const severityIcon = (sev: string) => {
        const icons = {
            info: <Info className="w-3 h-3" />,
            warning: <AlertTriangle className="w-3 h-3" />,
            error: <AlertCircle className="w-3 h-3" />,
            critical: <AlertOctagon className="w-3 h-3" />,
        };
        return icons[sev as keyof typeof icons] || icons.info;
    };

    const typeBadge = (type: string) => {
        const colors = {
            error: 'bg-red-50 text-red-700 border-red-200',
            supplier_action: 'bg-green-50 text-green-700 border-green-200',
            project_action: 'bg-blue-50 text-blue-700 border-blue-200',
            rfq_generation: 'bg-purple-50 text-purple-700 border-purple-200',
            ai_call: 'bg-orange-50 text-orange-700 border-orange-200',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor platform activity and diagnose issues. {count > 0 && `${count} total logs.`}
                    </p>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download CSV
                </button>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {logTypes.map((lt) => (
                        <button
                            key={lt.value}
                            onClick={() => {
                                setLogType(lt.value);
                                setPage(0);
                            }}
                            className={`${logType === lt.value
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                        >
                            {lt.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Date Range & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(0);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(0);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                        <select
                            value={severity}
                            onChange={(e) => {
                                setSeverity(e.target.value);
                                setPage(0);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Severities</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters */}
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                    <Filter className="w-4 h-4" />
                    Clear All Filters
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-8 px-3 py-3"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No logs found. Adjust your filters or check back later.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const isExpanded = expandedLogs.has(log.id);
                                    return (
                                        <>
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-4">
                                                    <button
                                                        onClick={() => toggleExpanded(log.id)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded border ${typeBadge(log.log_type)} capitalize`}>
                                                        {log.log_type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 w-fit ${severityBadge(log.severity)} capitalize`}>
                                                        {severityIcon(log.severity)}
                                                        {log.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {log.user?.email || <span className="text-gray-400">System</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {log.project?.name || log.supplier_id || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {log.message}
                                                    {log.error_type && (
                                                        <div className="text-xs text-gray-500 mt-1">Type: {log.error_type}</div>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={7} className="px-12 py-4">
                                                        <div className="bg-white rounded border border-gray-200 p-4">
                                                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Metadata</h4>
                                                            <pre className="text-xs text-gray-600 overflow-x-auto">
                                                                {JSON.stringify(log.metadata || {}, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {count > limit && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {page * limit + 1} to {Math.min((page + 1) * limit, count)} of {count} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= count}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
