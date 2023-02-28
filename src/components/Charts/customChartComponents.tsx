import classes from './chartsStyles.module.scss'

enum keyNames {
    total = 'Total',
    gay = 'Homosexual',
    predator = 'Predator',
    scavenger = 'Scavenger',
    child = 'Children',
    teen = 'Teens',
    mature = 'Adults',
    elder = 'Seniors',
    speed = 'Speed',
    breedingSensitivity = 'Breeding sensitivity',
    foodSensitivity = 'Food Sensitivity',
    breedingCD = 'Breeding cooldown',
    hatchingTime = 'Time to hatch',
    curiosity = 'Curiosity',
    immunity = 'Immunity',
    male = 'Male',
    female = 'Female',
    count = 'Amount of plants',
    totalNutrition = 'Plants Total Nutrition'
}

export const renderTooltipContent = (o: any) => <TooltipContent o={o}/>

interface ITooltipContentProps {
    o: any
    calculateLabel?: (name: string, value: number) => string | JSX.Element
}

export const TooltipContent = ({o, calculateLabel}: ITooltipContentProps) => {
    const {payload, label} = o;

    return payload ? <div className={classes.tooltipContainer}>
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
    </div> : <></>
};

export const CustomLegend = ({payload}: any) => {
    return <div className={classes.legendItemList}>
        {payload.map((entry: any, index: number) => {
            // @ts-ignore
            const itemName = keyNames[entry.value]
            return <div
                className={classes.legendItem}
                style={{color: entry.color}}
                key={`item-${index}`}>
                {itemName}
            </div>
        })}
    </div>
}