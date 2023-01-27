import React from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush
} from 'recharts';
import {barChartColors} from "../../constants/colors";
import {CustomLegend, renderTooltipContent} from "./customChartComponents";

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
    <XAxis dataKey={xAxisDataKey} stroke={'#fafafa'}/>
    <YAxis stroke={'#fafafa'}/>
    <Tooltip content={renderTooltipContent}/>
    <Legend content={<CustomLegend/>}/>
    <Brush height={20} fill={'#5fa35c'} stroke={'#fafafa'}/>
    {dataKeys.map((dataKey, index) =>
        <Bar
            dataKey={dataKey}
            key={`dataKey${index}`}
            fill={barChartColors[index]}
        />
    )}
</RechartsBarChart>

export default BarChart