import React from 'react';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-surface-border flex gap-4 overflow-x-auto ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-2 font-semibold text-sm border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-sage-500 text-sage-700'
                  : 'border-transparent text-ink-muted hover:text-ink-primary hover:border-sage-300'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-sage-500' : ''}`} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-sage-100 text-sage-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default variant = 'pills'
  return (
    <div className={`flex flex-wrap gap-2 p-1.5 bg-sage-50/80 rounded-2xl border border-sage-100 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white text-sage-700 shadow-soft font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-white/50'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-sage-500' : 'text-ink-muted'}`} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-sage-100 text-sage-800' : 'bg-cream-200 text-ink-muted'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
