import React, {ReactNode} from "react";
import classes from './Notification.module.scss'
import {clsSum} from "../../utils/utils";

interface INotificationProps {
    type: 'warning' | 'error' | 'info' | 'success',
    children: ReactNode | ReactNode[] | string
    className?: string
}

const Notification = ({type, children, className}: INotificationProps) => {

    return <div className={
        clsSum(
            classes.notificationContainer,
            type === 'warning' ? classes.warning : null,
            type === 'error' ? classes.error : null,
            type === 'info' ? classes.info : null,
            type === 'success' ? classes.success : null,
            className
        )
    }>
        {children}
    </div>
}

export default Notification