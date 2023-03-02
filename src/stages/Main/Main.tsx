import React, {memo, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import {appConstants} from "../../constants/simulation";
import BackgroundScene from "../../components/BackgroundScene/BackgroundScene";
import MainMenu from "./screens/MainMenu";
import HowTo from "./screens/HowTo";
import SimulationNew from "./screens/SimulationNew";
import Credits from "./screens/Credits";
import SimulationLoad from "./screens/SimulationLoad";
import SimulationStart from "./screens/SimulationStart";

export type mainMenuScreens = 'MAIN' | 'START' | 'HOW_TO' | 'CREDITS' | 'START_NEW' | 'START_LOAD'

export enum screenHeading {
    'MAIN' = 'MAIN MENU',
    'START' = 'START A SIMULATION',
    'HOW_TO' = 'SIMULATION PRINCIPLES',
    'CREDITS' = 'CREDITS',
    'START_NEW' = 'SIMULATION SETTINGS',
    'START_LOAD' = 'LOAD A SIM',
}

const MemoizedBackground = memo(BackgroundScene)

const Version = () => <span className={classes.version}>v. {appConstants.version}</span>

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const Main = ({setAppPhase}: IMainProps) => {
    const [currentScreen, setCurrentScreen] = useState<mainMenuScreens>('MAIN')

    return <>
        <Version/>
        <MemoizedBackground/>
        <div className={classes.container}>
            <h1>
                {screenHeading[currentScreen]}
            </h1>
            {currentScreen === 'MAIN' ?
                <MainMenu setCurrentScreen={setCurrentScreen}/> : <></>}
            {currentScreen === 'START' ?
                <SimulationStart setAppPhase={setAppPhase} setCurrentScreen={setCurrentScreen}/> : <></>}
            {currentScreen === 'HOW_TO' ?
                <HowTo setCurrentScreen={setCurrentScreen}/> : <></>}
            {currentScreen === 'CREDITS' ?
                <Credits setCurrentScreen={setCurrentScreen}/> : <></>}
            {currentScreen === 'START_NEW' ?
                <SimulationNew setAppPhase={setAppPhase} setCurrentScreen={setCurrentScreen}/> : <></>}
            {currentScreen === 'START_LOAD' ?
                <SimulationLoad setAppPhase={setAppPhase} setCurrentScreen={setCurrentScreen}/> : <></>}
        </div>
    </>
}

export default Main