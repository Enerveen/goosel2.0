import {
    Bar,
    CartesianGrid,
    ComposedChart as RechartsComposedChart,
    Line, ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {renderTooltipContent} from "./customChartComponents";

interface IComposedChartProps {
    data: any[],
    xAxisDataKey: string,
    lineDataKey: string,
    barDataKey: string
}

const ComposedChart = ({data, xAxisDataKey, lineDataKey, barDataKey}: IComposedChartProps) =>
    <ResponsiveContainer width={'100%'} height={400}>
        <RechartsComposedChart
            width={400}
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
            <YAxis orientation={'left'} yAxisId={`${barDataKey}Y`} stroke={'#413ea0'}/>
            <YAxis orientation={'right'} yAxisId={`${lineDataKey}Y`} stroke={'#ff7300'}/>
            <Tooltip content={renderTooltipContent}/>
            <Bar dataKey={barDataKey} fill="#413ea0" yAxisId={`${barDataKey}Y`}/>
            <Line type="monotone" dataKey={lineDataKey} stroke="#ff7300" yAxisId={`${lineDataKey}Y`} dot={false}/>
        </RechartsComposedChart>
    </ResponsiveContainer>

export default ComposedChart