import classes from './chartsStyles.module.scss'

enum keyNames {
    child = 'Children',
    teen = 'Teens',
    mature = 'Adults',
    elder = 'Seniors',
    speed = 'Speed',
    breedingSensitivity = 'Breeding sensitivity',
    foodSensitivity = 'Food Sensitivity',
    breedingCD = 'Breeding cooldown',
    hatchingTime = 'Time to hatch',
    male = 'Male',
    female = 'Female',
    count = 'Amount of plants',
    totalNutrition = 'Plants Total Nutrition'
}

const renderTooltipContent = (o: any) => <TooltipContent o={o}/>

interface ITooltipContentProps {
    o: any
    calculateLabel?: (name: string, value: number) => string | JSX.Element
}

export const TooltipContent = ({o, calculateLabel}: ITooltipContentProps) => {
    const {payload, label} = o;

    return <div className={classes.tooltipContainer}>
            <div className={classes.tooltipHeading}>Year {label}</div>
            <div className={classes.tooltipItemList}>
                {payload.map((entry: any, index: number) => {
                    // @ts-ignore
                    const itemName = keyNames[entry.name]
                    return <span className={classes.tooltipItem} key={`item-${index}`} style={{color: entry.color}}>
                        {calculateLabel ? calculateLabel(entry.name, entry.value) : `${itemName}: ${entry.value}`}
                    </span>
                })}
            </div>
        </div>
};

export default renderTooltipContent