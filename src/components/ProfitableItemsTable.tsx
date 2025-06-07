import React, { useState } from 'react';
import { Table, Card, Input, Space, Typography, Tag, Tooltip, Switch as AntSwitch, Button } from 'antd';
import { QuestionCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ComparisonResult } from '../types';
import { formatNumber } from '../utils';

const { Search } = Input;
const { Text } = Typography;

interface ProfitableItemsTableProps {
  data: ComparisonResult[];
  loading: boolean;
  gameSaleBonus: boolean;
  potionBonus: boolean;
  onBonusChange: (type: 'gameSaleBonus' | 'potionBonus', checked: boolean) => void;
}

const ProfitableItemsTable: React.FC<ProfitableItemsTableProps> = ({ 
  data, 
  loading, 
  gameSaleBonus, 
  potionBonus, 
  onBonusChange 
}) => {
  const [searchText, setSearchText] = useState('');
  const [tableHeight, setTableHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const startY = e.clientY;
    const startHeight = tableHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
      setTableHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };const columns: ColumnsType<ComparisonResult> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '30%',
      minWidth: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: ComparisonResult) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.category}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Game Sell Value',
      dataIndex: 'gameValue',
      key: 'gameValue',
      width: '12%',
      minWidth: 110,
      sorter: (a, b) => a.gameValue - b.gameValue,
      render: (value: number) => formatNumber(value),
      align: 'right',
    },
    {
      title: 'Market Sell Price',
      dataIndex: 'marketSellPrice',
      key: 'marketSellPrice',
      width: '12%',
      minWidth: 120,
      sorter: (a, b) => a.marketSellPrice - b.marketSellPrice,
      render: (value: number) => formatNumber(value),
      align: 'right',
    },
    {
      title: 'Volume',
      dataIndex: 'itemQuantity',
      key: 'itemQuantity',
      width: '8%',
      minWidth: 80,
      sorter: (a, b) => a.itemQuantity - b.itemQuantity,
      render: (value: number) => formatNumber(value),
      align: 'right',
    },
    {
      title: 'Profit/Each',
      dataIndex: 'profit',
      key: 'profit',
      width: '12%',
      minWidth: 95,
      sorter: (a, b) => a.profit - b.profit,
      render: (value: number) => {
        const colorClass = value > 100 ? 'profit-positive-text' : 
                          value > 0 ? 'profit-warning-text' : 
                          'profit-negative-text';
        return (
          <Text className={colorClass}>
            {formatNumber(value)}
          </Text>
        );
      },
      align: 'right',
    },
    {
      title: 'Total Profit',
      dataIndex: 'totalProfit',
      key: 'totalProfit',
      width: '15%',
      minWidth: 110,
      sorter: (a, b) => a.totalProfit - b.totalProfit,
      render: (value: number) => {
        const colorClass = value > 500 ? 'profit-positive-text' : 
                          value > 0 ? 'profit-warning-text' : 
                          'profit-negative-text';
        return (
          <Text strong className={colorClass}>
            {formatNumber(value)}
          </Text>
        );
      },
      align: 'right',
      defaultSortOrder: 'descend',
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercentage',
      key: 'profitPercentage',
      width: '11%',
      minWidth: 85,
      sorter: (a, b) => a.profitPercentage - b.profitPercentage,
      render: (value: number) => (
        <Tag color={value > 20 ? 'green' : value > 10 ? 'orange' : 'red'}>
          {formatNumber(value, 2)}%
        </Tag>
      ),
      align: 'right',
    },
  ];

  const getRowClassName = (record: ComparisonResult): string => {
    if (record.totalProfit <= 0) return 'profit-negative';
    if (record.totalProfit < 1000) return 'profit-warning';
    return 'profit-positive';
  };
  return (    <Card 
      title={
        <Space>
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              height: '20px',
              width: '20px',
              padding: 0,
              color: '#888888',
              fontSize: '10px'
            }}
            title={isCollapsed ? 'Expand table' : 'Collapse table'}
          />
          Profitable Items
          <Tooltip 
            title="Shows items where you can buy from players and sell directly to the game for profit. The game's sell value is higher than the current market price."
            placement="topLeft"
          >
            <QuestionCircleOutlined style={{ color: '#888888', fontSize: '14px' }} />
          </Tooltip>
        </Space>      }
      extra={
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Space>
              <Tooltip 
                title="Clan Upgrade: +10% Gold from selling items to the game. Enable this if you have the clan upgrade that increases gold from game sales by 10%."
                placement="topLeft"
              >
                <AntSwitch 
                  checkedChildren="Clan +10%"
                  unCheckedChildren="Clan +10%"
                  checked={gameSaleBonus}
                  onChange={(checked) => onBonusChange('gameSaleBonus', checked)}
                  size="small"
                />
              </Tooltip>
              <Tooltip 
                title="Potion of Negotiation: +5% Gold from selling items to the game. This is a consumable potion that costs gold (set in settings). Only enable if you plan to use the potion for this trading session."
                placement="topLeft"
              >
                <AntSwitch 
                  checkedChildren="Potion +5%"
                  unCheckedChildren="Potion +5%"
                  checked={potionBonus}
                  onChange={(checked) => onBonusChange('potionBonus', checked)}
                  size="small"
                />
              </Tooltip>
            </Space>
            <Space>
              <Search
                placeholder="Search items..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}              />
            </Space>
          </Space>
        </Space>
      }
    >
      {!isCollapsed && (
        <Table<ComparisonResult>
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          size="small"
          className="profit-table"
          rowClassName={getRowClassName}
          scroll={{ x: 800, y: tableHeight }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '25', '50', '100'],
            defaultPageSize: 25,
          }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <Text strong>
                  Total Items: {filteredData.length} | 
                  Total Profit: {formatNumber(filteredData.reduce((sum, item) => sum + item.totalProfit, 0))}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      )}
          {/* Drag-to-resize handle */}
      <div
        onMouseDown={!isCollapsed ? handleMouseDown : undefined}
        className={`table-resize-handle ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        style={{ cursor: isCollapsed ? 'default' : 'ns-resize' }}
      >
        <div className="table-resize-handle-grip" />
      </div>
    </Card>
  );
};

export default ProfitableItemsTable;
