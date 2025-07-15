import React, { useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryControl from './InventoryControl';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import InventoryContext from './InventoryContext';
import { closeContextMenu } from '../../store/contextMenu';
import Fade from '../utils/transitions/Fade';
import { imagePreloader } from '../../utils/imagePreloader';
import { getItemUrl } from '../../helpers';
import { isSlotWithItem } from '../../helpers';
import { Items } from '../../store/items';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const dispatch = useAppDispatch();

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);

    // Preload all item images when inventory opens to prevent pop-in
    const preloadInventoryImages = (inventory?: InventoryProps) => {
      if (inventory?.items) {
        const urls: string[] = [];
        inventory.items.forEach(item => {
          if (isSlotWithItem(item)) {
            const url = getItemUrl(item);
            if (url && url !== 'none' && !imagePreloader.isBlacklisted(url)) {
              urls.push(url);
            }
          }
        });
        // Use efficient batch preloading
        if (urls.length > 0) {
          imagePreloader.preloadImages(urls).catch(() => {
            // Silently fail
          });
        }
      }
    };

    // Preload images for both inventories
    preloadInventoryImages(data.leftInventory);
    preloadInventoryImages(data.rightInventory);

    // Only preload Items store images on first inventory open (when cache is empty)
    if (imagePreloader.getCacheStats().cachedCount === 0) {
      const itemUrls: string[] = [];
      Object.keys(Items).forEach(itemName => {
        if (itemName && Items[itemName]) {
          const url = getItemUrl(itemName);
          if (url && url !== 'none' && !imagePreloader.isBlacklisted(url)) {
            itemUrls.push(url);
          }
        }
      });
      // Use efficient batch preloading for Items store
      if (itemUrls.length > 0) {
        imagePreloader.preloadImages(itemUrls).catch(() => {
          // Silently fail
        });
      }
    }
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  return (
    <>
      <Fade in={inventoryVisible}>
        <div className="inventory-wrapper">
          <LeftInventory />
          <InventoryControl />
          <RightInventory />
          <Tooltip />
          <InventoryContext />
        </div>
      </Fade>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
