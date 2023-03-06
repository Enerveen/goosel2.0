import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";
import Tabs from "../../../components/Tabs/Tabs";
import {Tab} from "../../../types";

const TimeFlowInfo = () => {

    return <div>
        {'Some information about the time flow, I guess \n'.repeat(20)}
    </div>
}

const PlantsInfo = () => {

    return <div>
        {'Some information about plants, I guess \n'.repeat(20)}
    </div>
}

const StatsInfo = () => {

    return <div>
        {'Some information about genes & stats, I guess \n'.repeat(20)}
    </div>
}

const tabsList: Tab[] = [
    {id: 'time', content: <TimeFlowInfo/>, label: 'Time flow'},
    {id: 'plants', content: <PlantsInfo/>, label: 'Plants'},
    {id: 'Stats', content: <StatsInfo/>, label: 'Stats & Genes'}
]

interface IHowToProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const HowTo = ({setCurrentScreen}: IHowToProps) => {
    return <div className={classes.screenContainer}>
        <Tabs tabsList={tabsList} className={classes.tabs}/>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default HowTo