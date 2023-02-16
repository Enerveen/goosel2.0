import React from "react";
import classes from './Results.module.scss'
import AreaChart from "../../components/Charts/AreaChart";
import BarChart from "../../components/Charts/BarChart";
import DynamicsChart from "../../components/Charts/DynamicsChart";
import ComposedChart from "../../components/Charts/ComposedChart";
import LineChart from "../../components/Charts/LineChart";
import simulationStore from "../../stores/simulationStore";

const Results = () => {
    const statistics = simulationStore.getStatistics
    return <div className={classes.container}>
        <h1>
            FIN!
        </h1>
        <div className={classes.chartsSection}>
            <div className={classes.chartContainer}>
                <h2>Male/Female ratio</h2>
                <AreaChart data={statistics.gender} xAxisDataKey={'year'} dataKeys={['male', 'female']}/>
            </div>
            <div className={classes.chartContainer}>
                <h2>Population Change</h2>
                <DynamicsChart data={statistics.populationChange}/>
            </div>
            <div className={classes.chartContainer}>
                <h2>Plants count</h2>
                <ComposedChart
                    data={statistics.plantStats}
                    barDataKey={'count'}
                    xAxisDataKey={'year'}
                    lineDataKey={'totalNutrition'}
                />
            </div>
            <div className={classes.chartContainer}>
                <h2>Animals age groups</h2>
                <BarChart data={statistics.age} dataKeys={['child', 'teen', 'mature', 'elder']} xAxisDataKey={'year'}/>
            </div>
            <div className={classes.chartContainer}>
                <h2>Average population stats</h2>
                <LineChart
                    data={statistics.averageStats}
                    dataKeys={['speed', 'breedingSensitivity', 'foodSensitivity', 'breedingCD', 'hatchingTime']}
                    xAxisDataKey={'year'}/>
            </div>
        </div>

    </div>
}

export default Results