import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { ApiData, LocalData } from '../types';
import gameData from '../data/simplified_game_data.json';

interface DataFetcherProps {
  onDataFetch: (localData: LocalData, apiData: ApiData) => void;
  onSettingsClick: () => void;
}

const DataFetcher: React.FC<DataFetcherProps> = ({ onDataFetch, onSettingsClick }) => {
  const [loading, setLoading] = useState(false);

  const loadLocalJsonData = async (): Promise<LocalData> => {
    try {
      return gameData as LocalData;
    } catch (error) {
      console.error('Error loading local JSON:', error);
      throw new Error('Failed to load game data. Please refresh the page and try again.');
    }
  };  const fetchApiData = async (): Promise<ApiData> => {
    try {
      const apiUrl = 'https://query.idleclans.com/api/PlayerMarket/items/prices/latest?includeAveragePrice=true';
      
      const response = await fetch(apiUrl, {
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      if (!Array.isArray(apiData)) {
        throw new Error('API returned unexpected data format (not an array)');
      }
      
      return {
        items: apiData.map(item => ({
          id: item.itemId,
          name: `item_${item.itemId}`,
          marketValue: item.lowestSellPrice || 0,
          buyPrice: item.highestBuyPrice || 0,
          sellPrice: item.lowestSellPrice || 0,
          sellVolume: item.lowestPriceVolume || 0,
          buyVolume: item.highestPriceVolume || 0,
          dailyAveragePrice: item.dailyAveragePrice || 0
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching API data:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while fetching API data.');
    }
  };

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const [localData, apiData] = await Promise.all([
        loadLocalJsonData(),
        fetchApiData()
      ]);
      
      onDataFetch(localData, apiData);
      message.success('Data loaded successfully!');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space>
      <Tooltip title="Refresh market data">
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={handleFetchData}
        >
          Fetch Data
        </Button>
      </Tooltip>
      <Tooltip title="Open settings">
        <Button 
          icon={<SettingOutlined />}
          onClick={onSettingsClick}
        >
          Settings
        </Button>
      </Tooltip>
    </Space>
  );
};

export default DataFetcher;
