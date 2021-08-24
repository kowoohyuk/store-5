import React, { useEffect, useState } from 'react';
import { Tooltip, ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, TooltipProps } from 'recharts';
import styled from 'styled-components';
import { theme } from '@src/theme/theme';
import { BarChartData } from '@src/types/Chart';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Promotion } from '@src/types/Promotion';

interface Props {
  promotions: Promotion[];
}

const PromotionViewChart: React.FC<Props> = ({ promotions }) => {
  const [chartData, setChartData] = useState<BarChartData>([]);
  const COLORS = [
    theme.ChartColorRed,
    theme.ChartColorBlue,
    theme.ChartColorGreen,
    theme.ChartColorPurple,
    theme.ChartColorOrange,
    theme.ChartColorYellow,
  ];

  useEffect(() => {
    setChartData(
      promotions.map(({ title, view }) => ({
        name: title,
        value: view,
      }))
    );
  }, [promotions]);

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    const payloadItem = payload?.[0]?.payload;
    if (!active || !payloadItem) return null;
    return (
      <CustomTooltipContainer>
        <CustomTooltipLabel>{`상품명 : ${payloadItem.name}`}</CustomTooltipLabel>
        <CustomTooltipLabel>{`조회수 : ${payloadItem.value}`}</CustomTooltipLabel>
      </CustomTooltipContainer>
    );
  };

  return (
    <BarChartContainer>
      <BarChartTitle color={theme.black5}>프로모션 조회수 차트</BarChartTitle>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart width={20} height={30} data={chartData}>
          <Bar maxBarSize={30} dataKey='value' cursor='pointer' label={(entry) => entry.name}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <XAxis dataKey={'name'} />
          <YAxis dataKey={'value'} />
          <Tooltip cursor={false} content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </BarChartContainer>
  );
};

const BarChartContainer = styled.div`
  padding: 16px;
  width: 50%;
  height: 100%;
  position: relative;
  background-color: #fff;
  border-radius: 6px;
  font-size: 12px;
`;

const BarChartTitle = styled.p<{ color: string }>`
  color: ${(props) => props.color};
  font-weight: 700;
  font-size: 17px;
  margin-bottom: 1rem;
`;

const CustomTooltipContainer = styled('div')`
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  opacity: 0.95;
`;

const CustomTooltipLabel = styled('p')`
  padding: 8px;
  font-size: 12px;
`;

export default PromotionViewChart;
