import React, { useState } from 'react';
import { Table, Card, Input, Space, Typography, Tag, Button, message, Tooltip } from 'antd';
import { SearchOutlined, LineChartOutlined, QuestionCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UnderpricedResult } from '../types';

const { Search } = Input;
const { Text } = Typography;

interface UnderpricedItemsTableProps {
  data: UnderpricedResult[];
  loading: boolean;
}

const UnderpricedItemsTable: React.FC<UnderpricedItemsTableProps> = ({ data, loading }) => {  const [searchText, setSearchText] = useState('');
  const [fetchingData, setFetchingData] = useState<{ [key: number]: boolean }>({});
  const [tableHeight, setTableHeight] = useState(400); // Default height in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Drag resize functionality
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
  };

  const fetchExtendedData = async (itemId: number, itemName: string) => {
    setFetchingData(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const baseUrl = "https://query.idleclans.com";
      const apiUrl = `${baseUrl}/api/PlayerMarket/items/prices/latest/comprehensive/${itemId}`;
      
      const response = await fetch(apiUrl, { cache: 'no-cache' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data for item ${itemId}: ${response.status}`);
      }
        const comprehensiveData = await response.json();
      
      const itemIndex = data.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        data[itemIndex].comprehensiveData = {
          averagePrice1Day: comprehensiveData.averagePrice1Day,
          averagePrice7Days: comprehensiveData.averagePrice7Days,
          averagePrice30Days: comprehensiveData.averagePrice30Days,
          tradeVolume1Day: comprehensiveData.tradeVolume1Day || 0,
          tradeVolume7Days: comprehensiveData.tradeVolume7Days || 0,
          tradeVolume30Days: comprehensiveData.tradeVolume30Days || 0,
        };
      }
      
      message.success(`Extended data fetched for ${itemName}`);
    } catch (error) {
      console.error(`Failed to fetch extended data for ${itemName}:`, error);
      message.error(`Failed to fetch extended data for ${itemName}`);
    } finally {
      setFetchingData(prev => ({ ...prev, [itemId]: false }));
    }
  };  const columns: ColumnsType<UnderpricedResult> = [    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '25%',
      minWidth: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: UnderpricedResult) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.category}
          </Text>
        </Space>
      ),
    },    {
      title: 'Daily Average',
      dataIndex: 'dailyAveragePrice',
      key: 'dailyAveragePrice',
      width: '20%',
      minWidth: 140,
      sorter: (a, b) => a.dailyAveragePrice - b.dailyAveragePrice,
      render: (value: number, record: UnderpricedResult) => (
        <Space direction="vertical" size={0}>
          <Text strong>{formatNumber(value)}</Text>
          {record.comprehensiveData ? (
            <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
              <div><strong>1d:</strong> {formatNumber(record.comprehensiveData.averagePrice1Day || value)}</div>
              <div><strong>7d:</strong> {formatNumber(record.comprehensiveData.averagePrice7Days || 0)}</div>
              <div><strong>30d:</strong> {formatNumber(record.comprehensiveData.averagePrice30Days || 0)}</div>
            </div>          ) : (
            <Tooltip 
              title="Fetches more accurate 1d, 7d, and 30d average prices from the server. This provides better historical context."
              placement="topLeft"
            >
              <Button
                size="small"
                type="primary"
                icon={<LineChartOutlined />}
                loading={fetchingData[record.id]}
                onClick={() => fetchExtendedData(record.id, record.name)}
                className="fetch-data-button"
              >
                Fetch Data
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
      align: 'right',
    },    {
      title: 'Current Price',
      dataIndex: 'marketBuyPrice',
      key: 'marketBuyPrice',
      width: '12%',
      minWidth: 100,
      sorter: (a, b) => a.marketBuyPrice - b.marketBuyPrice,
      render: (value: number) => (
        <Text strong>{formatNumber(value)}</Text>
      ),
      align: 'right',
    },    {
      title: 'Price Ratio',
      dataIndex: 'priceRatio',
      key: 'priceRatio',
      width: '13%',
      minWidth: 90,
      sorter: (a, b) => a.priceRatio - b.priceRatio,
      render: (value: number) => {
        const colorClass = value < 60 ? 'underpriced-excellent-text' : 
                          value < 80 ? 'underpriced-good-text' : 
                          'underpriced-fair-text';
        return (
          <Tag color={value < 60 ? 'green' : value < 80 ? 'blue' : 'default'} className={colorClass}>
            {formatNumber(value, 1)}%
          </Tag>
        );
      },
      align: 'right',
    },    {
      title: 'Price Difference',
      dataIndex: 'priceDifference',
      key: 'priceDifference',
      width: '15%',
      minWidth: 110,
      sorter: (a, b) => a.priceDifference - b.priceDifference,
      render: (value: number) => {
        const colorClass = value > 500 ? 'underpriced-excellent-text' : 
                          value > 100 ? 'underpriced-good-text' : 
                          'underpriced-fair-text';
        return (
          <Text className={colorClass}>
            {formatNumber(value)}
          </Text>
        );
      },
      align: 'right',
    },    {
      title: 'Volume',
      dataIndex: 'sellVolume',
      key: 'sellVolume',
      width: '15%',
      minWidth: 80,
      sorter: (a, b) => a.sellVolume - b.sellVolume,
      render: (value: number) => formatNumber(value),
      align: 'right',
    },
  ];

  const getRowClassName = (record: UnderpricedResult): string => {
    if (record.priceRatio < 60) return 'underpriced-excellent';
    if (record.priceRatio < 80) return 'underpriced-good';
    return 'underpriced-fair';
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
          Underpriced Items
          <Tooltip 
            title="Shows items currently selling below their historical average price, indicating potential good buying opportunities. These items may be temporarily undervalued and could increase in price later."
            placement="topLeft"
          >
            <QuestionCircleOutlined style={{ color: '#888888', fontSize: '14px' }} />
          </Tooltip>
        </Space>
      }extra={
        <Space direction="vertical" style={{ width: '100%' }}>          <Search
            placeholder="Search items..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>
      }    >
      {!isCollapsed && (
        <Table<UnderpricedResult>
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          size="small"
          className="underpriced-table"
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
                  Total Underpriced Items: {filteredData.length}
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

export default UnderpricedItemsTable;
