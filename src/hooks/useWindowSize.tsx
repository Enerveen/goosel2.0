import {useLayoutEffect, useState} from "react";
import simulationStore from "../stores/simulationStore";

const useWindowSize = () => {
    const [size, setSize] = useState({width: 0, height: 0});
    useLayoutEffect(() => {
        const updateSize = () => {
            setSize({width: window.innerWidth, height: window.innerHeight});
            simulationStore.setWindowSize({width: window.innerWidth, height: window.innerHeight})
            document.documentElement.style.setProperty(' — app-height', `${window.innerHeight}px`)
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

export default useWindowSize