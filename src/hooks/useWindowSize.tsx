import {useLayoutEffect, useState} from "react";
import {SimulationStore} from "../stores/simulationStore";

const useWindowSize = (store?: SimulationStore) => {
    const [size, setSize] = useState({width: 0, height: 0});
    useLayoutEffect(() => {
        const updateSize = () => {
            setSize({width: window.innerWidth, height: window.innerHeight});
            if (store) {
                store.setWindowSize({width: window.innerWidth, height: window.innerHeight})
            }
            document.documentElement.style.setProperty(' — app-height', `${window.innerHeight}px`)
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [store]);
    return size;
}

export default useWindowSize