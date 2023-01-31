import {create} from "zustand";
import {defaultSimulationConstants} from "../constants/simulation";
import {SimulationConstants} from "../types";
import {persist} from "zustand/middleware";

interface IConstantsStore {
    constants: SimulationConstants,
    setConstants: (constants: SimulationConstants) => void
}

const useSimConstantsStore = create(
    persist<IConstantsStore>(set => ({
        constants: defaultSimulationConstants,
        setConstants: (constants: SimulationConstants) => set(() => ({
            constants
        }))
    }), {name: 'sim-const-storage'})
)

export default useSimConstantsStore