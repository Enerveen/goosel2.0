import {Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";
import {TooltipContent} from "./customChartComponents";


interface IDynamicsChartProps {
    data: {value: number, year: number}[]
}

const gradientOffset = (data: {value: number, year: number}[]) => {
    const dataMax = Math.max(...data.map((i) => i.value));
    const dataMin = Math.min(...data.map((i) => i.value));

    if (dataMax <= 0) {
        return 0;
    }
    if (dataMin >= 0) {
        return 1;
    }

    return dataMax / (dataMax - dataMin);
};

const calculateTooltipItemLabel = (name: string, value: number) => {
    const commonStyles = {fontSize: '18px'}
    return value > 0  ? <span style={{color: 'green', ...commonStyles}}>{`Growth: ${value} animals`}</span>
        : value < 0 ? <span style={{color: 'red', ...commonStyles}}>{`Decrease: ${Math.abs(value)} animals`}</span>
            : <span style={commonStyles}>No changes in population</span>

}

const renderTooltipContent = (o: any) => <TooltipContent o={o} calculateLabel={calculateTooltipItemLabel}/>

const DynamicsChart = ({data}:IDynamicsChartProps) => {
    const off = gradientOffset(data);

    return <AreaChart
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" stroke={'#fafafa'}/>
        <YAxis stroke={'#fafafa'}/>
        <Tooltip content={renderTooltipContent}/>
        <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor="green" stopOpacity={1} />
                <stop offset={off} stopColor="red" stopOpacity={1} />
            </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke="#000" fill="url(#splitColor)" />
    </AreaChart>
}

export default DynamicsChart