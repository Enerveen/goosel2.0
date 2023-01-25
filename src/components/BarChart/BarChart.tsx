import React from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import {barChartColors} from "../../constants/colors";

interface IBarChartProps {
    data: any[],
    dataKeys: string[],
    xAxisDataKey: string
}

const BarChart = ({data, dataKeys, xAxisDataKey}: IBarChartProps) => <RechartsBarChart
    width={1200}
    height={400}
    data={data}
    margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
    }}
>
    <CartesianGrid strokeDasharray="3 3"/>
    <XAxis dataKey={xAxisDataKey}/>
    <YAxis/>
    <Tooltip/>
    <Legend/>
    {dataKeys.map((dataKey, index) =>
        <Bar
            dataKey={dataKey}
            key={`dataKey${index}`}
            fill={barChartColors[index]}
        />
    )}
</RechartsBarChart>

export default BarChart