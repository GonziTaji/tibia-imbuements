import createStore from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    baseItemPrices,
    EQUIPEMENT_SLOT,
    imbuementTypesData,
    IMBUEMENT_POWER,
    IMBUEMENT_TYPE,
    pricePerPower,
} from '../data';
import { Imbuement } from '../types';

export type SlotData = {
    [slot: string]: {
        imbuements: Imbuement[];
        slotQuantity: number;
    };
};

export type ImbuementStore = {
    slots: SlotData;
    itemPrices: { [item: string]: number };
    changeImbuement: (slot: string, index: number, power: number, type: string) => void;
    changeSlotQuantity: (slot: string, quantity: number) => void;
    changePrice: (item: string, price: number) => void;
    loadPrices: () => void;
};

const pricesStorageKey = 'ti_item_prices';

function createImbuement(power: number, type: string, itemPrices: { [item: string]: number }): Imbuement {
    const imbuementTypeData = imbuementTypesData[type];

    const imbuement = {
        power,
        type,
        items: imbuementTypeData.items[power],
        itemsTotal: 0,
        total: 0,
    };

    for (const { item, quantity } of imbuement.items) {
        imbuement.itemsTotal += itemPrices[item] * quantity;
    }

    if (imbuement.type === IMBUEMENT_TYPE.None) {
        imbuement.total = imbuement.itemsTotal; // Should be 0
    } else {
        const price = pricePerPower[imbuement.power];

        imbuement.total = imbuement.itemsTotal + price.price + price.noFailureFee;
    }

    return imbuement;
}

const initialSlots: SlotData = {
    [EQUIPEMENT_SLOT.Helmet]: { imbuements: [], slotQuantity: 2 },
    [EQUIPEMENT_SLOT.Armor]: { imbuements: [], slotQuantity: 3 },
    [EQUIPEMENT_SLOT.Weapon]: { imbuements: [], slotQuantity: 3 },
    [EQUIPEMENT_SLOT.Shield]: { imbuements: [], slotQuantity: 1 },
    [EQUIPEMENT_SLOT.Boots]: { imbuements: [], slotQuantity: 1 },
};

for (const slot in initialSlots) {
    for (let i = 0; i < initialSlots[slot].slotQuantity; i++) {
        initialSlots[slot].imbuements.push(createImbuement(IMBUEMENT_POWER.Basic, IMBUEMENT_TYPE.None, baseItemPrices));
    }
}

const useImbuementStore = createStore(
    immer<ImbuementStore>((set) => ({
        slots: initialSlots,
        imbuements: [],
        itemPrices: baseItemPrices,
        changeSlotQuantity: (slot, quantity) =>
            set((state) => {
                const currentQuantity = state.slots[slot].imbuements.length;

                if (currentQuantity > quantity) {
                    state.slots[slot].imbuements = state.slots[slot].imbuements.slice(0, quantity);
                } else if (currentQuantity < quantity) {
                    for (let i = currentQuantity; i < quantity; i++) {
                        state.slots[slot].imbuements.push(
                            createImbuement(IMBUEMENT_POWER.Basic, IMBUEMENT_TYPE.None, state.itemPrices)
                        );
                    }
                }

                state.slots[slot].slotQuantity = quantity;
            }),
        changeImbuement: (slot: string, index: number, power: number, type: string) =>
            set((state) => {
                const imbuements = state.slots[slot].imbuements;

                const indexOfExisting = imbuements.findIndex((imb) => imb.type === type);

                if (indexOfExisting !== -1 && indexOfExisting !== index) {
                    imbuements.splice(
                        indexOfExisting,
                        1,
                        createImbuement(imbuements[indexOfExisting].power, IMBUEMENT_TYPE.None, state.itemPrices)
                    );
                }

                imbuements.splice(index, 1, createImbuement(power, type, state.itemPrices));
            }),
        changePrice: (item: string, price: number) =>
            set((state) => {
                state.itemPrices[item] = price;

                for (const slot in EQUIPEMENT_SLOT) {
                    const slotImbuements = state.slots[slot as string].imbuements;

                    for (let i = 0; i < slotImbuements.length; i++) {
                        const imbuement = slotImbuements[i];
                        const usesItem = imbuementTypesData[imbuement.type].items[IMBUEMENT_POWER.Powerfull].some(
                            (_item) => _item.item === item
                        );

                        if (usesItem) {
                            slotImbuements[i] = createImbuement(imbuement.power, imbuement.type, state.itemPrices);
                        }
                    }
                }

                localStorage.setItem(pricesStorageKey, JSON.stringify(state.itemPrices));
            }),
        loadPrices: () =>
            set((state) => {
                const storageItemPricesStr = localStorage.getItem(pricesStorageKey);

                if (storageItemPricesStr) {
                    try {
                        const storageItemPrices = JSON.parse(storageItemPricesStr);

                        for (const item in baseItemPrices) {
                            if (storageItemPrices[item]) {
                                state.itemPrices[item] = storageItemPrices[item];
                            }
                        }
                    } catch (e) {
                        console.error('UH OH! Item prices from local storage could not be loaded', e);
                        localStorage.removeItem(pricesStorageKey);
                    }
                }
            }),
    }))
);

export default useImbuementStore;
