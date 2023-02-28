import React from 'react';
import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {areaChartColors} from "../../constants/colors";
import {renderTooltipContent} from "./customChartComponents";

interface IAreaChartProps {
    data: any[],
    xAxisDataKey: string,
    dataKeys: string[]
}

const toPercent = (decimal: number) => `${decimal * 100}%`;

const AreaChart = ({data, xAxisDataKey, dataKeys}: IAreaChartProps) =>
    <ResponsiveContainer width={'100%'} height={400}>
        <RechartsAreaChart
            width={400}
            height={400}
            data={data}
            stackOffset="expand"
            margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            }}
        >
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip content={renderTooltipContent}/>
            <XAxis dataKey={xAxisDataKey} stroke={'#fafafa'}/>
            <YAxis tickFormatter={toPercent} stroke={'#fafafa'}/>
            <>
                {dataKeys.map((dataKey, index) =>
                    <Area
                        type={'monotone'}
                        key={`dataKey${index}`}
                        dataKey={dataKey}
                        stackId="1"
                        fill={areaChartColors[index]}
                        stroke={areaChartColors[index]}
                    />
                )}
            </>
        </RechartsAreaChart>
    </ResponsiveContainer>

export default AreaChart