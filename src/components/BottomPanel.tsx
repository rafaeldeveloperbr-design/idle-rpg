import React, { useState } from 'react';
import AttributesTab from './tabs/AttributesTab';
import SkillsTab from './tabs/SkillsTab';
import InventoryTab from './tabs/InventoryTab';

type TabId = 'attributes' | 'skills' | 'inventory';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'attributes', label: 'Atributos', icon: '📊' },
  { id: 'skills', label: 'Habilidades', icon: '⚡' },
  { id: 'inventory', label: 'Inventário', icon: '🎒' },
];

const BottomPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('attributes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'attributes':
        return <AttributesTab />;
      case 'skills':
        return <SkillsTab />;
      case 'inventory':
        return <InventoryTab />;
      default:
        return <AttributesTab />;
    }
  };

  return (
    <div className="w-full bg-[#1a1a2e] border-t-2 border-[#2d2d5e] flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#2d2d5e]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[9px] transition-all border-b-2 ${
              activeTab === tab.id
                ? 'tab-active text-purple-300 border-purple-500'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#16213e]/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[220px] overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BottomPanel;
