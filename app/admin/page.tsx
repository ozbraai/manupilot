import { Users, Truck, Briefcase, FileText } from 'lucide-react';

export default function AdminDashboard() {
    const stats = [
        { name: 'Total Users', value: '1,234', icon: Users, change: '+12%', changeType: 'positive' },
        { name: 'Active Suppliers', value: '56', icon: Truck, change: '+3%', changeType: 'positive' },
        { name: 'Active Projects', value: '89', icon: Briefcase, change: '+24%', changeType: 'positive' },
        { name: 'Pending RFQs', value: '12', icon: FileText, change: '-5%', changeType: 'negative' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Overview of platform activity and health.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <span className={`font-medium ${item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.change}
                                </span>
                                <span className="text-gray-500"> from last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">Activity chart placeholder</p>
                </div>
            </div>
        </div>
    );
}
