import {
    Bar,
    CartesianGrid,
    ComposedChart as RechartsComposedChart,
    Line,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

interface IComposedChartProps {
    data: any[],
    xAxisDataKey: string,
    lineDataKey: string,
    barDataKey: string
}

const ComposedChart = ({data, xAxisDataKey, lineDataKey, barDataKey}:IComposedChartProps) => <RechartsComposedChart
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
    <CartesianGrid stroke="#f5f5f5" />
    <XAxis dataKey={xAxisDataKey} />
    <YAxis orientation={'left'} yAxisId={`${barDataKey}Y`} stroke={'#413ea0'}/>
    <YAxis orientation={'right'} yAxisId={`${lineDataKey}Y`} stroke={'#ff7300'}/>
    <Tooltip />
    <Bar dataKey={barDataKey} fill="#413ea0" yAxisId={`${barDataKey}Y`}/>
    <Line type="monotone" dataKey={lineDataKey} stroke="#ff7300" yAxisId={`${lineDataKey}Y`}/>
</RechartsComposedChart>

export default ComposedChart