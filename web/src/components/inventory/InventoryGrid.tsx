import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';
import { selectPlayerInfo } from '../../store/inventory';

const PAGE_SIZE = 30;

const InventoryGrid: React.FC<{ inventory: Inventory }> = ({ inventory }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);
  const playerInfo = useAppSelector(selectPlayerInfo);

  // Filter
  const filteredItems = useMemo(() => {
    if (!searchTerm) return inventory.items;
    return inventory.items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory.items, searchTerm]);

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  // Split inventory
  const isPlayerInventory = inventory.type === 'player';
  const mainInventoryItems = isPlayerInventory ? filteredItems.slice(0, 30) : filteredItems;
  const backpackItems = isPlayerInventory ? filteredItems.slice(30) : [];

    const renderInventorySection = (items: typeof inventory.items, title: string, showSearch: boolean = false) => (
    <div className="inventory-section">
      <div className="inventory-section-header">
        <div className="inventory-section-header-left">
          <h3>{title}</h3>
          <div className="inventory-section-weight">
            <span>{weight / 1000}/{inventory.maxWeight ? inventory.maxWeight / 1000 : 0}kg</span>
          </div>
        </div>
        {showSearch && (
          <div className="inventory-search-container">
            <input
              type="text"
              placeholder="Search Item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-search-input"
            />
            <div className="inventory-search-icons">
              <button className="inventory-search-icon">🔍</button>
              <button className="inventory-search-icon">📁</button>
              <button className="inventory-search-icon">📊</button>
              <button className="inventory-search-icon">❓</button>
            </div>
          </div>
        )}
      </div>
      <WeightBar percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />
      <div className="inventory-grid-container" ref={containerRef}>
        {items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
          <InventorySlot
            key={`${inventory.type}-${inventory.id}-${item.slot}`}
            item={item}
            ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
            inventoryType={inventory.type}
            inventoryGroups={inventory.groups}
            inventoryId={inventory.id}
          />
        ))}
      </div>
    </div>
  );

  if (isPlayerInventory) {
    return (
      <div className="player-inventory-container" style={{ pointerEvents: isBusy ? 'none' : 'auto' }}>
        {/* Player Info Header */}
        <div className="player-info-header">
          <div className="player-info-left">
            <h2>{playerInfo ? `${playerInfo.firstName} ${playerInfo.lastName}` : 'Unknown Player'}</h2>
            <div className="player-info-details">
              <span>ID: {playerInfo ? playerInfo.id : 'Unknown'}</span>
              <span className="player-info-citizenship">ID: {playerInfo ? playerInfo.citizenship : 'Unknown'}</span>
            </div>
          </div>
          <div className="player-info-right">
            <div className="player-job-info">
              <span>Job: {playerInfo ? playerInfo.job : 'Unknown'}</span>
              <span>Rank: {playerInfo ? playerInfo.rank : 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Main Inventory Section */}
        {renderInventorySection(mainInventoryItems, "INVENTORY", true)}

        {/* Backpack Section */}
        {renderInventorySection(backpackItems, "BACKPACK")}
      </div>
    );
  }

  return (
    <>
      <div className="inventory-grid-wrapper" style={{ pointerEvents: isBusy ? 'none' : 'auto' }}>
        <div>
          <div className="inventory-grid-header-wrapper">
            <p>{inventory.label}</p>
            {inventory.maxWeight && (
              <p>
                {weight / 1000}/{inventory.maxWeight / 1000}kg
              </p>
            )}
          </div>
          <WeightBar percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />
        </div>
        <div className="inventory-grid-container" ref={containerRef}>
          <>
            {inventory.items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
              <InventorySlot
                key={`${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </>
        </div>
      </div>
    </>
  );
};

export default InventoryGrid;
