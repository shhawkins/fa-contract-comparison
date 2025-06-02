'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { ComparisonItem } from './ComparisonTool';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'scheduling' | 'pay' | 'benefits' | 'work_rules' | 'overtime' | 'sick_leave';
  icon: string;
  sections: {
    documentA: string[];
    documentB: string[];
  };
  suggestedQuestions: string[];
}

interface ComparisonTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  recentComparisons: ComparisonItem[];
  onLoadComparison: (comparison: ComparisonItem) => void;
}

const AVIATION_TEMPLATES: Template[] = [
  {
    id: 'schedule-changes',
    title: 'Schedule Changes',
    description: 'Compare scheduling rules, trip assignments, and scheduling flexibility',
    category: 'scheduling',
    icon: '📅',
    sections: {
      documentA: ['scheduling', 'trip assignment', 'crew scheduling'],
      documentB: ['scheduling', 'trip assignment', 'crew scheduling']
    },
    suggestedQuestions: [
      'How do minimum rest periods compare?',
      'What changed in trip assignment rules?',
      'Are there new scheduling flexibility options?'
    ]
  },
  {
    id: 'pay-scale-updates',
    title: 'Pay Scale Updates',
    description: 'Compare hourly rates, per diem, and salary progression',
    category: 'pay',
    icon: '💰',
    sections: {
      documentA: ['pay scale', 'hourly rate', 'per diem', 'salary'],
      documentB: ['pay scale', 'hourly rate', 'per diem', 'salary']
    },
    suggestedQuestions: [
      'How much did hourly rates increase?',
      'What changed in the pay scale progression?',
      'Are there new per diem rates?'
    ]
  },
  {
    id: 'benefits-comparison',
    title: 'Benefits Comparison',
    description: 'Compare health insurance, retirement, and other benefits',
    category: 'benefits',
    icon: '🏥',
    sections: {
      documentA: ['health insurance', 'retirement', 'benefits', '401k'],
      documentB: ['health insurance', 'retirement', 'benefits', '401k']
    },
    suggestedQuestions: [
      'What changed in health insurance coverage?',
      'Are there improvements to retirement benefits?',
      'What new benefits were added?'
    ]
  },
  {
    id: 'overtime-rules',
    title: 'Overtime Rules',
    description: 'Compare overtime pay rates and calculation methods',
    category: 'overtime',
    icon: '⏰',
    sections: {
      documentA: ['overtime', 'time and a half', 'premium pay'],
      documentB: ['overtime', 'time and a half', 'premium pay']
    },
    suggestedQuestions: [
      'How do overtime calculation methods compare?',
      'What changed in overtime eligibility?',
      'Are there new premium pay opportunities?'
    ]
  },
  {
    id: 'sick-leave-policies',
    title: 'Sick Leave Policies',
    description: 'Compare sick leave accrual, usage, and medical benefits',
    category: 'sick_leave',
    icon: '🤒',
    sections: {
      documentA: ['sick leave', 'medical leave', 'accrual'],
      documentB: ['sick leave', 'medical leave', 'accrual']
    },
    suggestedQuestions: [
      'How did sick leave accrual rates change?',
      'What are the new medical leave options?',
      'Are there changes to sick leave usage policies?'
    ]
  },
  {
    id: 'base-assignment-rules',
    title: 'Base Assignment Rules',
    description: 'Compare base bidding, transfers, and assignment policies',
    category: 'work_rules',
    icon: '🏢',
    sections: {
      documentA: ['base assignment', 'bidding', 'transfer', 'domicile'],
      documentB: ['base assignment', 'bidding', 'transfer', 'domicile']
    },
    suggestedQuestions: [
      'What changed in base bidding procedures?',
      'Are there new transfer opportunities?',
      'How do domicile assignments work now?'
    ]
  }
];

const CATEGORY_COLORS = {
  scheduling: 'bg-blue-100 text-blue-800 border-blue-200',
  pay: 'bg-green-100 text-green-800 border-green-200',
  benefits: 'bg-purple-100 text-purple-800 border-purple-200',
  work_rules: 'bg-orange-100 text-orange-800 border-orange-200',
  overtime: 'bg-red-100 text-red-800 border-red-200',
  sick_leave: 'bg-pink-100 text-pink-800 border-pink-200'
};

export default function ComparisonTemplates({ 
  onSelectTemplate, 
  recentComparisons, 
  onLoadComparison 
}: ComparisonTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? AVIATION_TEMPLATES
    : AVIATION_TEMPLATES.filter(template => template.category === selectedCategory);

  const categories = Array.from(new Set(AVIATION_TEMPLATES.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Recent Comparisons */}
      {recentComparisons.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Comparisons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentComparisons.slice(0, 6).map((comparison) => (
              <div
                key={comparison.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
                onClick={() => onLoadComparison(comparison)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {comparison.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(comparison.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comparison.userExplanation && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {comparison.userExplanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Templates by Category</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            All Templates
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{template.title}</h4>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded border mt-1 ${
                    CATEGORY_COLORS[template.category]
                  }`}>
                    {template.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            
            <div className="space-y-2">
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-1">Suggested Questions:</h5>
                <ul className="space-y-1">
                  {template.suggestedQuestions.slice(0, 2).map((question, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
                size="sm"
                className="w-full"
              >
                Use This Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600">No templates found for this category</p>
        </div>
      )}
    </div>
  );
} 