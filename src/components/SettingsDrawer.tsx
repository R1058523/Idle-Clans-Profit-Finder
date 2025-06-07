import React from 'react';
import { Drawer, Form, Switch, InputNumber, Divider, Typography, Space, Radio, Tooltip } from 'antd';
import { Settings } from '../types';
import { UnorderedListOutlined, AppstoreOutlined, LayoutOutlined, EyeOutlined, CalculatorOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  layoutMode: 'stacked' | 'sideBySide';
  onLayoutModeChange: (mode: 'stacked' | 'sideBySide') => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
  layoutMode,
  onLayoutModeChange,
}) => {  const [form] = Form.useForm();
  const overridePotionCost = Form.useWatch('overridePotionCost', form) ?? settings.overridePotionCost;
  const handleFormChange = (changedValues: any, allValues: any) => {
    onSettingsChange({
      ...settings,
      ...allValues
    });
  };

  const handleLayoutModeChange = (e: any) => {
    onLayoutModeChange(e.target.value);
  };

  React.useEffect(() => {
    form.setFieldsValue(settings);
  }, [settings, form]);
  return (
    <Drawer
      title="Settings"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        initialValues={settings}
        preserve={false}
      >
        <Title level={5}><LayoutOutlined /> Layout Options</Title>
        <Form.Item label="Table Layout">
          <Radio.Group 
            value={layoutMode} 
            onChange={handleLayoutModeChange} 
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="stacked"><UnorderedListOutlined /> Stacked</Radio.Button>
            <Radio.Button value="sideBySide"><AppstoreOutlined /> Side by Side</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider />

        <Title level={5}><EyeOutlined /> Display Options</Title>        <Form.Item 
          name="hideNonProfitable" 
          valuePropName="checked"
          label="Hide non-profitable items"
        >
          <Switch />
        </Form.Item>

        <Form.Item 
          name="hideSubProfitable" 
          valuePropName="checked"
          label="Hide sub-profitable items"
          extra="Hides profitable items below threshold"
        >
          <Switch />
        </Form.Item>

        <Form.Item 
          name="minProfit" 
          label="Minimum Total Profit"
          extra="Filters based on total profit (all available volume)"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={100}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        <Form.Item 
          name="underpricedThreshold" 
          label="Underpriced Threshold (%)"
          extra="Items selling below this percentage of their average price"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={99}
            step={1}
            formatter={(value) => `${value}%`}
          />
        </Form.Item>

        <Divider />

        <Title level={5}><CalculatorOutlined /> Price Calculations</Title>

        <Form.Item
          name="potionCost" 
          label="Potion of Negotiation Cost"
          extra={overridePotionCost 
            ? "Manual override enabled - cost will not be updated from market data. Disable override to allow automatic updates."
            : "Automatically updated from market data when you fetch data. Enable override below to manually control this value."
          }
        >
          <InputNumber
            style={{ 
              width: '100%',
              ...(overridePotionCost && {
                backgroundColor: '#1a1a1a',
                borderColor: '#d4b106',
                borderWidth: '2px',
                borderStyle: 'solid'
              })
            }}
            className={overridePotionCost ? 'override-active' : ''}
            min={0}
            step={100}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>        <Form.Item 
          name="overridePotionCost" 
          valuePropName="checked"
          label={
            <Tooltip title="When enabled, prevents automatic updates to potion cost from fetched market data. Your manual cost will be preserved.">
              <span>
                {overridePotionCost ? <LockOutlined /> : <UnlockOutlined />} 
                {overridePotionCost ? ' Manual Override Active' : ' Auto-Update from Market Data'}
              </span>
            </Tooltip>
          }
        >
          <Switch />
        </Form.Item>

        <Divider />

        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Settings are automatically saved to your browser and persist across page refreshes. 
            Changes are applied immediately to the data tables.
          </Text>
        </div>
      </Form>
    </Drawer>
  );
};

export default SettingsDrawer;
