import React from "react";
import classes from './Results.module.scss'
import AreaChart from "../../components/AreaChart/AreaChart";
import BarChart from "../../components/BarChart/BarChart";
import DynamicsChart from "../../components/DynamicsChart/DynamicsChart";
import ComposedChart from "../../components/ComposedChart/ComposedChart";

const Results = ({statistics}: any) => {
    return <div className={classes.container}>
        <h1>
            FIN!
        </h1>
        <div className={classes.chartsSection}>
            <div className={classes.chartContainer}>
                <AreaChart data={statistics.gender} xAxisDataKey={'year'} dataKeys={['male', 'female']}/>
            </div>
            <div className={classes.chartContainer}>
                <DynamicsChart data={statistics.populationChange}/>
            </div>
            <div className={classes.chartContainer}>
                <ComposedChart
                    data={statistics.plantStats}
                    barDataKey={'count'}
                    xAxisDataKey={'year'}
                    lineDataKey={'totalNutrition'}
                />
            </div>
            <div className={classes.chartContainer}>
                <BarChart data={statistics.age} dataKeys={['child', 'teen', 'mature', 'elder']} xAxisDataKey={'year'}/>
            </div>
            <div className={classes.chartContainer}>
                <BarChart
                    data={statistics.averageStats}
                    dataKeys={['speed', 'breedingSensitivity', 'foodSensitivity', 'breedingCD', 'hatchingTime']}
                    xAxisDataKey={'year'}/>
            </div>
        </div>

    </div>
}

export default Results