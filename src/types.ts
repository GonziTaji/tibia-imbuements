export type ImbuementPrice = {
    price: number;
    noFailureFee: number;
};

export type ItemData = {
    item: string;
    quantity: number;
};

export type ImbuementTypeData = {
    effectName: string;
    effectValues: number[];
    items: ItemData[][];
};

export type Imbuement = {
    power: number;
    type: string;
    items: Array<ItemData>;
    itemsTotal: number;
    total: number;
};
