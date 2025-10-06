import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface SectionIssuesChartProps {
  data: {
    section: string;
    issues: number;
  }[];
}

export const SectionIssuesChart = ({ data }: SectionIssuesChartProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Issues by Section</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 120,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="section" 
                width={100}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} issues`, 'Count']}
              />
              <Bar dataKey="issues" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};