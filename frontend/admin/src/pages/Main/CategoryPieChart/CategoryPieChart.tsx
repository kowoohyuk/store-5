import CategoryAPI from '@src/apis/categoryAPI';
import { theme } from '@src/theme/theme';
import { PieChartData } from '@src/types/Chart';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

const CategoryPieChart = () => {
  const [chartData, setChartData] = useState<PieChartData>([]);
  const COLORS = [
    theme.ChartColorRed,
    theme.ChartColorBlue,
    theme.ChartColorYellow,
    theme.ChartColorGreen,
    theme.ChartColorPurple,
    theme.ChartColorOrange,
  ];

  // const COLORS = ['#2F343A', '#E64A45', '#717D8C', '#BDB69C', '#80CEB9', '#41AAC4', '#462066', '#F2C249', '#E6772E'];

  useEffect(() => {
    async function fetchChartData() {
      try {
        const { result } = await CategoryAPI.getParentCategoryCount();
        setChartData(result);
      } catch (err) {
        console.error(err);
      }
    }
    fetchChartData();
  }, []);

  return (
    <PieChartContainer>
      <PieChartTitle color={theme.black5}>카테고리 비율</PieChartTitle>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            isAnimationActive={false}
            labelLine={false}
            label={(entry) => entry.name}
            outerRadius={120}
            innerRadius={60}
            dataKey='value'
            cursor='pointer'
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </PieChartContainer>
  );
};

const PieChartContainer = styled.div`
  padding: 16px;
  width: 50%;
  height: 100%;
  background-color: #fff;
  border-radius: 6px;
`;

const PieChartTitle = styled.span<{ color: string }>`
  position: absolute;
  color: ${(props) => props.color};
  font-weight: 600;
`;

export default CategoryPieChart;
