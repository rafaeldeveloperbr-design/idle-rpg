import React from 'react';
import { createPortal } from 'react-dom';
import AttributesTab from './tabs/AttributesTab';
import SkillsTab from './tabs/SkillsTab';
import InventoryTab from './tabs/InventoryTab';
import QuestsTab from './tabs/QuestsTab';
import type { HeroAttributes, AttributeCosts, Skill, Item, Equipment } from '../types/game';
import type { Quest } from '../data/questsData';

type DrawerType = 'attributes' | 'skills' | 'inventory' | 'quests' | null;

interface DrawerProps {
  activeDrawer: DrawerType;
  onClose: () => void;
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
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
}

const drawerTitles: Record<string, { icon: string; label: string }> = {
  attributes: { icon: '⚔️', label: 'Atributos' },
  skills: { icon: '✨', label: 'Skills' },
  inventory: { icon: '🎒', label: 'Bag' },
  quests: { icon: '📜', label: 'Quests' },
};

const Drawer: React.FC<DrawerProps> = ({
  activeDrawer,
  onClose,
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
  quests,
  onCompleteQuest,
}) => {
  if (!activeDrawer) return null;

  const renderContent = () => {
    switch (activeDrawer) {
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

  const title = drawerTitles[activeDrawer];

  return createPortal(
    <>


      {/* Drawer Panel */}
      <div className="fixed inset-x-0 top-[calc(34dvh+3rem)] bottom-16 z-[50] rounded-t-2xl bg-slate-950/95 backdrop-blur-md border-t-2 border-slate-600 flex flex-col min-h-0">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <span className="text-2xl">{title.icon}</span>
            <span>{title.label}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ✖
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </>,
    document.body
  );
};

export default Drawer;
