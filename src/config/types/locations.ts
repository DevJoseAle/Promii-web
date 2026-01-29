export interface IVzlaState {
    id: string,
    name: string
}

export interface IVzlaCity {
    id: string,
    name: string,
    stateId: string
}

export interface IVzlaZone {
    id: string,
    name: string,
    cityId: string
}