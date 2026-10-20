import React, { useState } from 'react';
import AttributesTab from './tabs/AttributesTab';
import SkillsTab from './tabs/SkillsTab';
import InventoryTab from './tabs/InventoryTab';
import QuestsTab from './tabs/QuestsTab';
import type { HeroAttributes, AttributeCosts, Skill, Item, Equipment } from '../types/game';
import type { Quest } from '../data/questsData';

type TabId = 'attributes' | 'skills' | 'inventory' | 'quests' | null;

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

interface BottomPanelProps {
  heroAttributes: HeroAttributes;
  attributeCosts: AttributeCosts;
  heroGold: number;
  onUpgradeAttribute: (attribute: keyof HeroAttributes) => void;
  skills: Skill[];
  equippedSkillIds: string[];
  onUpgradeSkill: (skillId: string) => void;
  onToggleAutoCast: (skillId: string) => void;
  onEquipSkill: (skillId: string) => void;
  inventory: Item[];
  equipment: Equipment;
  inventoryCapacity: number;
  onEquipItem: (itemId: string) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onSellItem: (itemId: string) => void;
  onResetGame: () => void;
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
}

const tabs: Tab[] = [
  { id: 'attributes', label: 'Atributos', icon: '⚔️' },
  { id: 'skills', label: 'Skills', icon: '✨' },
  { id: 'inventory', label: 'Bag', icon: '🎒' },
  { id: 'quests', label: 'Quests', icon: '📜' },
];

const BottomPanel: React.FC<BottomPanelProps> = ({
  heroAttributes,
  attributeCosts,
  heroGold,
  onUpgradeAttribute,
  skills,
  equippedSkillIds,
  onUpgradeSkill,
  onToggleAutoCast,
  onEquipSkill,
  inventory,
  equipment,
  inventoryCapacity,
  onEquipItem,
  onUnequipItem,
  onSellItem,
  onResetGame,
  quests,
  onCompleteQuest,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(null);

  const handleTabClick = (tabId: TabId) => {
    // Toggle drawer: if same tab is clicked, close it
    if (activeTab === tabId) {
      setActiveTab(null);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleCloseDrawer = () => {
    setActiveTab(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'attributes':
        return (
          <AttributesTab
            heroAttributes={heroAttributes}
            attributeCosts={attributeCosts}
            heroGold={heroGold}
            onUpgradeAttribute={onUpgradeAttribute}
          />
        );
      case 'skills':
        return (
          <SkillsTab
            skills={skills}
            heroGold={heroGold}
            equippedSkillIds={equippedSkillIds}
            onUpgradeSkill={onUpgradeSkill}
            onToggleAutoCast={onToggleAutoCast}
            onEquipSkill={onEquipSkill}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            inventory={inventory}
            equipment={equipment}
            inventoryCapacity={inventoryCapacity}
            onEquipItem={onEquipItem}
            onUnequipItem={onUnequipItem}
            onSellItem={onSellItem}
          />
        );
      case 'quests':
        return (
          <QuestsTab
            quests={quests}
            onCompleteQuest={onCompleteQuest}
          />
        );
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? `${tab.icon} ${tab.label}` : '';
  };

  return (
    <>
      {/* Bottom Bar - Fixed at bottom */}
      <div className="h-16 w-full fixed bottom-0 left-0 z-40 bg-slate-900 border-t border-slate-700 flex items-center justify-around px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all ${
              activeTab === tab.id
                ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Drawer Overlay (dark backdrop) */}
      {activeTab && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer Panel - Slides up from bottom */}
      <div
        className={`h-[80vh] w-full fixed bottom-16 left-0 z-50 rounded-t-2xl bg-slate-950/95 backdrop-blur-md border-t-2 border-slate-600 transition-transform duration-300 ${
          activeTab ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-purple-300">{getTabTitle()}</h2>
          <button
            onClick={handleCloseDrawer}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ✖
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto h-[calc(80vh-64px)]">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default BottomPanel;
