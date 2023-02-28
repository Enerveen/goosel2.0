import React, {memo, useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";
import {appConstants, defaultSimConstants} from "../../constants/simulation";
import BackgroundScene from "../../components/BackgroundScene/BackgroundScene";
import Checkbox from "../../components/Checkbox/Checkbox";
import Button from "../../components/Button/Button";
import {validateSimulationConstants} from "../../utils/validators";
import {clsSum} from "../../utils/utils";

type mainMenuScreens = 'MAIN' | 'START' | 'HOW_TO' | 'CREDITS'

enum screenHeading {
    'MAIN' = 'MAIN MENU',
    'START' = 'SIMULATION SETTINGS',
    'HOW_TO' = 'SIMULATION PRINCIPLES',
    'CREDITS' = 'CREDITS'
}

const localConstants = localStorage.getItem('simConstants')

const MemoizedBackground = memo(BackgroundScene)

const Version = () => <span className={classes.version}>v. {appConstants.version}</span>

interface IMainMenuProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}
const MainMenu = ({setCurrentScreen}: IMainMenuProps) => {
    return <div className={classes.screenContainer}>
        <Button onClick={() => setCurrentScreen('START')} className={classes.button}>
            START SIMULATION
        </Button>
        <Button onClick={() => setCurrentScreen('HOW_TO')} className={classes.button}>
            SIMULATION PRINCIPLES
        </Button>
        <Button onClick={() => setCurrentScreen('CREDITS')} className={classes.button}>
            CREDITS
        </Button>
    </div>
}
interface ISimulationStartProps {
    setAppPhase: (phase: appPhase) => void,
    setCurrentScreen: (screen: mainMenuScreens) => void
}
const SimulationStart = ({setAppPhase, setCurrentScreen}:ISimulationStartProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const [constantsValues, setConstantsValues] = useState(() => localConstants ?
        validateSimulationConstants(JSON.parse(localConstants)) : defaultSimConstants
    )
    const toggleSettingsCheckbox = useCallback(
        () => setIsDefaultSettings(prevState => !prevState), []
    )

    const onSimStart = useCallback(() => {
        if (!isDefaultSettings) {
            simulationStore.setSimulationConstants(constantsValues)
        }
        localStorage.setItem('simConstants', JSON.stringify(constantsValues))
        setAppPhase('STARTED')
    }, [constantsValues, setAppPhase, isDefaultSettings])

    return <div className={classes.screenContainer}>
        <Button onClick={onSimStart} className={classes.button}>
            START!
        </Button>
        <Checkbox
            className={clsSum(isDefaultSettings ? classes.checkboxNotExpanded : null)}
            label={'Start with default settings'}
            onChange={toggleSettingsCheckbox}
            checked={isDefaultSettings}
        />
        {!isDefaultSettings ?
            <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

interface ICreditsProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const Credits = ({setCurrentScreen}:ICreditsProps) => {
    return <div className={classes.screenContainer}>
        <h2>Nothing to see here</h2>
        <h2>yet...</h2>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

interface IHowToProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}
const HowTo = ({setCurrentScreen}:IHowToProps) => {
    return <div className={classes.screenContainer}>
        <h2>Nothing to see here</h2>
        <h2>yet...</h2>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

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
        </div>
    </>
}

export default Main