import React, {useState} from "react";
import classes from './Tabs.module.scss'
import {Tab} from "../../types";
import {clsSum} from "../../utils/utils";

interface ITabNavItemProps {
    label: string,
    onClick: () => void
}

const TabNavItem = ({label, onClick}: ITabNavItemProps) => {
    return <div className={classes.tabNavItem} onClick={onClick}>
        {label}
    </div>
}

interface ITabsProps {
    tabsList: Tab[],
    className?: string
}
const Tabs = ({className, tabsList}: ITabsProps) => {
    const [currentTabId, setCurrentTabId] = useState(tabsList[0].id)

    return <div className={clsSum(classes.container, className)}>
        <div className={classes.tabNav}>
            {tabsList.map(({label, id}) =>
                <TabNavItem label={label} key={`${id}-nav`} onClick={() => setCurrentTabId(id)}/>)}
        </div>
        <div className={classes.tabContent}>
            {tabsList.find(({id}) => id === currentTabId)?.content || <>Invalid tab</>}
        </div>
    </div>
}

export default Tabs