import { Inventory } from './inventory';
import { Slot } from './slot';

export interface PlayerInfo {
  firstName: string;
  lastName: string;
  id: number;
  job: string;
  rank: string;
  citizenship: string;
}

export type State = {
  leftInventory: Inventory;
  rightInventory: Inventory;
  itemAmount: number;
  shiftPressed: boolean;
  isBusy: boolean;
  additionalMetadata: Array<{ metadata: string; value: string }>;
  playerInfo?: PlayerInfo;
  history?: {
    leftInventory: Inventory;
    rightInventory: Inventory;
  };
};
