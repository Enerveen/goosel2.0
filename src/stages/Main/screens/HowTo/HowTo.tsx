import classes from './HowTo.module.scss'
import Button from "../../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../../Main";
import Tabs from "../../../../components/Tabs/Tabs";
import {Tab} from "../../../../types";
import TimeFlowInfo from "./TimeFlowTab";
import PlantsInfo from "./PlantsTab";
import StatsInfo from "./StatsTab";
import BehaviorInfo from "./BehaviorTab";

interface IHowToProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const HowTo = ({setCurrentScreen}: IHowToProps) => {

    const tabsList: Tab[] = [
        {id: 'time', content: (setTab) => <TimeFlowInfo setTab={setTab}/>, label: 'Time flow'},
        {id: 'plants', content: () => <PlantsInfo/>, label: 'Plants'},
        {id: 'stats', content: (setTab) => <StatsInfo setTab={setTab}/>, label: 'Stats & Genes'},
        {id: 'behavior', content: (setTab) => <BehaviorInfo setTab={setTab}/>, label: 'Geese behaviour'}
    ]
    return <div className={classes.screenContainer}>
        <Tabs tabsList={tabsList} className={classes.tabs}/>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default HowTo