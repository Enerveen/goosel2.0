import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";
import Tabs from "../../../components/Tabs/Tabs";
import {Tab} from "../../../types";

const TimeFlowInfo = ({setTab}: {setTab: (id:string) => void}) => {

    return <div className={classes.infoContent}>
        <p>
            As in the real life, time is constantly flowing from the start of simulation till it's end.
            Though, simulation process can be speed up using <span className={classes.special}>Speed slider</span> which
            can be found in simulation control panel.
        </p>
        <p>
            At the same panel you may find some sort of a clock, which is meant to inform you about the current date.
            One day lasts 1/12 of a second of real time, one month consists of 30 days and one year consists
            of 4 month (Beakuary, Flapril, Honkgust and Feathember. So, by default, 1 year lasts 10 seconds.
        </p>
        <p>
            Time affects different processes in simulation, the most important examples are provided below:
        </p>
        <ul>
            <li>
                Every 1/5 of a day there is a chance of spawning a <span className={classes.special}>Plant</span>. That
                chance can be configured in pre-start simulation settings or right during it's process
                with <span className={classes.special}>Plant spawn chance slider</span>.
            </li>
            <li>
                As <span className={classes.special}>Geese</span> grow up and then get old, they have
                various possibilities and behaviour depending on their age. It is described with more details
                in <span className={classes.link} onClick={() => setTab('plants')} >Geese behaviour</span> tab.
            </li>
            <li>At the end of each year, statistics gathers to later be represented in simulation report</li>
        </ul>
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

const BehaviourInfo = () => {

    return <div>
        {'Some information about behaviour, I guess \n'.repeat(20)}
    </div>
}

interface IHowToProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const HowTo = ({setCurrentScreen}: IHowToProps) => {

    const tabsList: Tab[] = [
        {id: 'time', content: (setTab) => <TimeFlowInfo setTab={setTab}/>, label: 'Time flow'},
        {id: 'plants', content: () => <PlantsInfo/>, label: 'Plants'},
        {id: 'stats', content: () => <StatsInfo/>, label: 'Stats & Genes'},
        {id: 'behaviour', content: () => <BehaviourInfo/>, label: 'Geese behaviour'}
    ]
    return <div className={classes.screenContainer}>
        <Tabs tabsList={tabsList} className={classes.tabs}/>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default HowTo