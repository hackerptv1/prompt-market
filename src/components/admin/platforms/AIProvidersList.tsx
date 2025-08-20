import React from 'react';
import { Edit2, Trash2, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';

const providers = [
  {
    id: '1',
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    models: ['GPT-4', 'GPT-3.5', 'DALL-E 3'],
    apiEndpoint: 'https://api.openai.com/v1',
    status: 'active',
    promptCount: 2450,
    avgCostPerRun: 0.15
  },
  {
    id: '2',
    name: 'Anthropic',
    logo: 'https://seeklogo.com/images/A/anthropic-claude-logo-7ABEA5C5A9-seeklogo.com.png',
    models: ['Claude 2', 'Claude Instant'],
    apiEndpoint: 'https://api.anthropic.com/v1',
    status: 'active',
    promptCount: 1280,
    avgCostPerRun: 0.12
  },
  {
    id: '3',
    name: 'Midjourney',
    logo: 'https://seeklogo.com/images/M/midjourney-logo-02E160DA6E-seeklogo.com.png',
    models: ['V6', 'V5', 'V4'],
    apiEndpoint: 'https://api.midjourney.com/v1',
    status: 'inactive',
    promptCount: 890,
    avgCostPerRun: 0.20
  }
];

export function AIProvidersList() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Provider</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Models</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">API Endpoint</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Avg. Cost</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-medium text-gray-900">{provider.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model) => (
                      <span
                        key={model}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {provider.apiEndpoint}
                    <a
                      href={provider.apiEndpoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 text-sm">
                    {provider.status === 'active' ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-medium">Inactive</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {provider.promptCount.toLocaleString()} prompts
                </td>
                <td className="px-6 py-4 text-gray-500">
                  ${provider.avgCostPerRun.toFixed(2)}/run
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}