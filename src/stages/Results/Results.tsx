import React, {useCallback} from "react";
import classes from './Results.module.scss'
import AreaChart from "../../components/Charts/AreaChart";
import BarChart from "../../components/Charts/BarChart";
import DynamicsChart from "../../components/Charts/DynamicsChart";
import ComposedChart from "../../components/Charts/ComposedChart";
import LineChart from "../../components/Charts/LineChart";
import simulationStore from "../../stores/simulationStore";
import {appPhase} from "../../types";
import Button from "../../components/Button/Button";

interface IResultsProps {
    setAppPhase: (phase: appPhase) => void
}

const Results = ({setAppPhase}: IResultsProps) => {
    const statistics = simulationStore.getStatistics
    const {reset} = simulationStore

    const onReturn = useCallback(() => {
        setAppPhase('NOT_STARTED')
        reset()
    }, [setAppPhase, reset])

    return <div className={classes.container}>
        <h1>
            SIMULATION REPORT
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
                <h2>Animals genes representation</h2>
                <BarChart data={statistics.genes} dataKeys={['total', 'gay', 'predator', 'scavenger']} xAxisDataKey={'year'}/>
            </div>
            <div className={classes.chartContainer}>
                <h2>Average population stats</h2>
                <LineChart
                    data={statistics.averageStats}
                    dataKeys={['speed', 'breedingSensitivity', 'foodSensitivity', 'breedingCD', 'hatchingTime', 'curiosity', 'immunity']}
                    xAxisDataKey={'year'}/>
            </div>

        </div>
            <Button className={classes.backBtn} onClick={onReturn}>
                Return to Main Menu
            </Button>
    </div>
}

export default Results