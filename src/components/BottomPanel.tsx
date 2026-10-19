import React, { useState } from 'react';
import AttributesTab from './tabs/AttributesTab';
import SkillsTab from './tabs/SkillsTab';
import InventoryTab from './tabs/InventoryTab';
import QuestsTab from './tabs/QuestsTab';
import type { HeroAttributes, AttributeCosts, Skill, Item, Equipment } from '../App';
import type { Quest } from '../data/questsData';

type TabId = 'attributes' | 'skills' | 'inventory' | 'quests';

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
  { id: 'attributes', label: 'Atributos', icon: '📊' },
  { id: 'skills', label: 'Habilidades', icon: '⚡' },
  { id: 'inventory', label: 'Inventário', icon: '🎒' },
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
  const [activeTab, setActiveTab] = useState<TabId>('attributes');

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
        return (
          <AttributesTab
            heroAttributes={heroAttributes}
            attributeCosts={attributeCosts}
            heroGold={heroGold}
            onUpgradeAttribute={onUpgradeAttribute}
          />
        );
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
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-all border-b-2 ${
              activeTab === tab.id
                ? 'tab-active text-purple-300 border-purple-500'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#16213e]/50'
            }`}
          >
            <span className="text-sm sm:text-base">{tab.icon}</span>
            <span className="inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[240px] overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BottomPanel;
