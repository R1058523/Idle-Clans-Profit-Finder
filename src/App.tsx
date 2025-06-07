import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Spin, message } from 'antd';
import DataFetcher from './components/DataFetcher';
import ProfitableItemsTable from './components/ProfitableItemsTable';
import UnderpricedItemsTable from './components/UnderpricedItemsTable';
import SettingsDrawer from './components/SettingsDrawer';
import { ApiData, LocalData, ComparisonResult, UnderpricedResult, Settings } from './types';
import { compareData, findUnderpricedItems } from './utils';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const DEFAULT_SETTINGS: Settings = {
  gameSaleBonus: true,
  potionBonus: false,
  potionCost: 5000,
  overridePotionCost: false,
  minProfit: 1000,
  hideNonProfitable: true,
  hideSubProfitable: false,
  underpricedThreshold: 40,
};

const STORAGE_KEYS = {
  SETTINGS: 'idleClansSettings',
  LAYOUT_MODE: 'idleClansLayoutMode',
};

const loadSettingsFromStorage = (): Settings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsedSettings };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return DEFAULT_SETTINGS;
};

const saveSettingsToStorage = (settings: Settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

const loadLayoutModeFromStorage = (): 'stacked' | 'sideBySide' => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT_MODE);
    if (saved === 'stacked' || saved === 'sideBySide') {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to load layout mode from localStorage:', error);
  }
  return 'stacked';
};

const saveLayoutModeToStorage = (layoutMode: 'stacked' | 'sideBySide') => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_MODE, layoutMode);
  } catch (error) {
    console.warn('Failed to save layout mode to localStorage:', error);
  }
};

const App: React.FC = () => {
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [profitableItems, setProfitableItems] = useState<ComparisonResult[]>([]);
  const [underpricedItems, setUnderpricedItems] = useState<UnderpricedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'stacked' | 'sideBySide'>(() => {
    const loaded = loadLayoutModeFromStorage();
    return loaded;
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const loaded = loadSettingsFromStorage();
    return loaded;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveSettingsToStorage(settings);
    }
  }, [settings, isInitialized]);
  useEffect(() => {
    if (isInitialized) {
      saveLayoutModeToStorage(layoutMode);
    }
  }, [layoutMode, isInitialized]);

  const handleBonusChange = (type: 'gameSaleBonus' | 'potionBonus', checked: boolean) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [type]: checked,
    }));
  };

  const handleDataFetch = async (local: LocalData, api: ApiData) => {
    setLoading(true);
    try {
      setLocalData(local);
      setApiData(api);

      const potionItem = api.items.find(item => item.id === 409);
      
      if (potionItem && potionItem.dailyAveragePrice > 0 && !settings.overridePotionCost) {
        const newCost = Math.round(potionItem.dailyAveragePrice);
        setSettings(prevSettings => ({
          ...prevSettings,
          potionCost: newCost
        }));
        message.success(`Data loaded! Potion cost updated to ${newCost.toLocaleString()} gold based on market data.`);
      } else if (settings.overridePotionCost) {
        message.success('Data processed successfully! Using manual potion cost override.');
      } else {
        message.success('Data processed successfully!');
      }
      
      const profitable = compareData(local, api, settings);
      setProfitableItems(profitable);
      
      const underpriced = findUnderpricedItems(api, local, settings);
      setUnderpricedItems(underpriced);
      
    } catch (error) {
      console.error('Error processing data:', error);
      message.error('Failed to process data');
    } finally {      setLoading(false);
    }
  };

  useEffect(() => {
    if (localData && apiData) {
      setLoading(true);
      try {
        const profitable = compareData(localData, apiData, settings);
        setProfitableItems(profitable);
        
        const underpriced = findUnderpricedItems(apiData, localData, settings);
        setUnderpricedItems(underpriced);
      } catch (error) {
        console.error('Error recalculating data:', error);
        message.error('Failed to recalculate data');
      } finally {
        setLoading(false);
      }    }
  }, [settings, localData, apiData]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0, color: 'white' }}>
          Idle Clans Profit Finder
        </Title>
        <DataFetcher onDataFetch={handleDataFetch} onSettingsClick={() => setSettingsVisible(true)} />
      </Header>
      <Content style={{ padding: '24px' }}>
        <Spin spinning={loading}>
          <Row gutter={[24, 24]} className={`layout-${layoutMode}`}>
            <Col 
              xs={24} 
              sm={24} 
              md={layoutMode === 'sideBySide' ? 12 : 24} 
              lg={layoutMode === 'sideBySide' ? 12 : 24} 
              xl={layoutMode === 'sideBySide' ? 12 : 24}
            >
              <ProfitableItemsTable 
                data={profitableItems}
                loading={loading}
                gameSaleBonus={settings.gameSaleBonus}
                potionBonus={settings.potionBonus}
                onBonusChange={handleBonusChange}
              />
            </Col>
            <Col 
              xs={24} 
              sm={24} 
              md={layoutMode === 'sideBySide' ? 12 : 24} 
              lg={layoutMode === 'sideBySide' ? 12 : 24} 
              xl={layoutMode === 'sideBySide' ? 12 : 24}
            >
              <UnderpricedItemsTable 
                data={underpricedItems}
                loading={loading}
              />
            </Col>          </Row>
        </Spin>
      </Content>
      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        settings={settings}
        onSettingsChange={setSettings}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />
    </Layout>
  );
};

export default App;