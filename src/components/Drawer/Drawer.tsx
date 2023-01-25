import classes from './Drawer.module.scss'
import {clsSum} from "../../utils/utils";
import {ReactNode} from "react";
import Cross from "../../icons/Cross";

interface IDrawerProps {
    open: boolean,
    children: ReactNode | ReactNode[]
    onClose: () => void
}

const Drawer = (props:IDrawerProps) => {
    const {open, children, onClose} = props

    return <div className={clsSum(classes.outerContainer, open ? classes.active : null)}>
        <div className={classes.innerContainer}>
            <div className={classes.closeIcon} onClick={onClose}>
                <Cross/>
            </div>
            {children}
        </div>
    </div>
}

export default Drawer