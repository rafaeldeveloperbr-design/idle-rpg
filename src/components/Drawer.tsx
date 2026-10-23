import React from 'react';
import AttributesTab from './tabs/AttributesTab';
import SkillsTab from './tabs/SkillsTab';
import InventoryTab from './tabs/InventoryTab';
import QuestsTab from './tabs/QuestsTab';
import type { HeroAttributes, AttributeCosts, Skill, Item, Equipment } from '../App';
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

  return (
    <>

      {/* Drawer Content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain [overflow-wrap:anywhere]">
        {renderContent()}
      </div>
    </>
  );
};

export default Drawer;
