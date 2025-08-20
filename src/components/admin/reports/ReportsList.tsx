import React from 'react';
import { AlertTriangle, MessageSquare, MoreVertical, CheckCircle } from 'lucide-react';

export function ReportsList() {
  const reports = [
    {
      id: '1',
      type: 'content',
      title: 'Inappropriate Content in Prompt',
      reporter: 'John Doe',
      reportedUser: 'Sarah Johnson',
      status: 'open',
      priority: 'high',
      description: 'The prompt contains inappropriate content that violates community guidelines...',
      createdAt: '2024-03-15 10:30 AM',
      comments: 3
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Processing Issue',
      reporter: 'Mike Wilson',
      reportedUser: null,
      status: 'in-progress',
      priority: 'medium',
      description: 'Unable to process payment for order #1234. Transaction keeps failing...',
      createdAt: '2024-03-15 09:45 AM',
      comments: 2
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="divide-y divide-gray-200">
        {reports.map((report) => (
          <div key={report.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                report.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  report.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'open' ? 'bg-red-100 text-red-800' :
                        report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by {report.reporter}
                      {report.reportedUser && ` • Against ${report.reportedUser}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{report.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{report.createdAt}</span>
                  <span>{report.comments} comments</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {report.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}