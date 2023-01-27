import {CartesianGrid, Legend, Line, Tooltip, XAxis, YAxis, LineChart as RechartsLineChart, Brush} from "recharts";
import {CustomLegend, renderTooltipContent} from "./customChartComponents";
import {barChartColors} from "../../constants/colors";
import React from "react";
import classes from './chartsStyles.module.scss'

interface ILineChartProps {
    data: any[],
    dataKeys: string[],
    xAxisDataKey: string
}

const LineChart = ({data, dataKeys, xAxisDataKey}: ILineChartProps) => <RechartsLineChart
    width={1200}
    className={classes.chart}
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
    <Tooltip content={renderTooltipContent}/>
    <Legend content={<CustomLegend/>}/>
    <Brush height={20} fill={'#5fa35c'}/>
    {dataKeys.map((dataKey, index) =>
        <Line
            dataKey={dataKey}
            key={`dataKey${index}`}
            stroke={barChartColors[index]}
            strokeWidth={4}
        />
    )}
</RechartsLineChart>

export default LineChart