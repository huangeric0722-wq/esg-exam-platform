"use client";

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

/**
 * 自定義標籤渲染，處理中文長標籤換行，避免被容器切掉
 */
const CustomTick = ({ x, y, payload, radius, index }) => {
  const text = payload.value;
  // ESG 分類標籤長度較長，進行折行處理
  let lines = [];
  if (text.length > 5) {
    lines.push(text.slice(0, 4));
    lines.push(text.slice(4));
  } else {
    lines.push(text);
  }

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
          className="font-medium"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const CustomRadarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center">
        <p className="text-zinc-400">尚無足夠數據顯示能力雷達圖</p>
      </div>
    );
  }

  // 領域顏色映射 (ESG 不同領域給予不同色彩)
  const categoryColors = {
    '永續風險管理與治理': '#10b981', // Emerald
    '永續基本概念': '#3b82f6',     // Blue
    '永續資訊揭露': '#f59e0b',     // Amber
    '永續金融': '#8b5cf6',         // Violet
    '未分類': '#94a3b8'            // Slate
  };

  // 提取數據中的鍵（除了 subject 和 fullMark 以外的動態鍵名）
  const dataKeys = data.length > 0 
    ? Object.keys(data[0]).filter(k => k !== 'subject' && k !== 'fullMark')
    : [];

  return (
    <div className="w-full h-full bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-2 shadow-2xl overflow-hidden min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={<CustomTick />}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          
          {dataKeys.map((key, idx) => {
            // 找出對應的領域名稱來匹配顏色
            const item = data.find(d => Object.keys(d).includes(key));
            const subject = item ? item.subject : '未分類';
            const color = categoryColors[subject] || categoryColors['未分類'];

            return (
              <Radar
                key={key}
                name={subject}
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.5}
                strokeWidth={2}
              />
            );
          })}
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomRadarChart;
