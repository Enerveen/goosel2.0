import React, {useState} from "react";
import classes from './Tabs.module.scss'
import {Tab} from "../../types";
import {clsSum} from "../../utils/utils";
import {barChartColors} from "../../constants/colors";

interface ITabNavItemProps {
    label: string,
    color: string,
    onClick: () => void,
    isActive: boolean
}

const TabNavItem = ({label, onClick, color, isActive}: ITabNavItemProps) => {
    return <div
        className={classes.tabNavItem}
        onClick={onClick}
        style={{backgroundColor: isActive ? color : `${color}80`}}>
        {label}
    </div>
}

interface ITabsProps {
    tabsList: Tab[],
    className?: string,
    initialTabId?: string
}
const Tabs = ({className, tabsList, initialTabId}: ITabsProps) => {
    const [currentTabId, setCurrentTabId] = useState( initialTabId || tabsList[0].id)

    return <div className={clsSum(classes.container, className)}>
        <div className={classes.tabNav}>
            {tabsList.map(({label, id}, index) =>
                <TabNavItem
                    label={label}
                    key={`${id}-nav`}
                    onClick={() => setCurrentTabId(id)}
                    color={barChartColors[index]}
                    isActive={currentTabId === id}
                />)}
        </div>
        <div className={classes.tabContent}>
            {tabsList.find(({id}) => id === currentTabId)?.content(setCurrentTabId) || <>Invalid tab</>}
        </div>
    </div>
}

export default Tabs