import createStore from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    baseItemPrices,
    EQUIPEMENT_SLOT,
    ImbuementMaxSlot,
    imbuementTypesData,
    IMBUEMENT_POWER,
    IMBUEMENT_TYPE,
    ITEM,
    pricePerPower,
} from '../data';
import { Imbuement, ItemData } from '../types';

export type SlotData = {
    [slot: string]: {
        imbuements: Imbuement[];
        slotQuantity: number;
    };
};

export type ImbuementStore = {
    slots: SlotData;
    itemPrices: { [item: string]: number };
    itemStock: { [item: string]: number };
    itemsNeeded: ItemData[];
    changeImbuement: (slot: string, index: number, power: number, type: string) => void;
    changeSlotQuantity: (slot: string, quantity: number) => void;
    changePrice: (item: string, price: number) => void;
    changeStock: (item: string, price: number) => void;
    loadSavedData: () => void;
};

const pricesStorageKey = 'ti_item_prices';
const stockStorageKey = 'ti_item_stock';

function createImbuement(power: number, type: string, itemPrices: { [item: string]: number }): Imbuement {
    const imbuementTypeData = imbuementTypesData[type];

    const imbuement: Imbuement = {
        power,
        type,
        items: imbuementTypeData.items[power],
        itemsTotal: 0,
        total: 0,
        goldTokenValue: 2 * (power + 1) * itemPrices[ITEM.GoldToken],
        totalWithGoldToken: 0,
    };

    for (const { item, quantity } of imbuement.items) {
        imbuement.itemsTotal += itemPrices[item] * quantity;
    }

    if (imbuement.type === IMBUEMENT_TYPE.None) {
        imbuement.total = imbuement.itemsTotal; // Should be 0
    } else {
        const price = pricePerPower[imbuement.power];

        imbuement.total = imbuement.itemsTotal + price.price + price.noFailureFee;
        imbuement.totalWithGoldToken = imbuement.goldTokenValue + price.price + price.noFailureFee;
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

const initialItemStock = Object.values(ITEM).reduce((acc, itemKey) => ({ ...acc, [itemKey]: 0 }), {});

const getImbuements = (slots: SlotData) => Object.values(slots).flatMap((slot) => slot.imbuements);

const getItemsNeeded = (imbuements: Imbuement[]) => {
    return imbuements.flatMap((imb) => imbuementTypesData[imb.type].items[imb.power]);
};

const useImbuementStore = createStore(
    immer<ImbuementStore>((set) => ({
        slots: initialSlots,
        itemPrices: baseItemPrices,
        itemStock: initialItemStock,
        itemsNeeded: [],
        changeSlotQuantity: (slot, quantity) => {
            if (ImbuementMaxSlot[slot] < quantity) {
                return;
            }

            return set((state) => {
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

                state.itemsNeeded = getItemsNeeded(getImbuements(state.slots));
            });
        },
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
                state.itemsNeeded = getItemsNeeded(getImbuements(state.slots));
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

                        if (usesItem || item === ITEM.GoldToken) {
                            slotImbuements[i] = createImbuement(imbuement.power, imbuement.type, state.itemPrices);
                        }
                    }
                }

                localStorage.setItem(pricesStorageKey, JSON.stringify(state.itemPrices));
            }),
        changeStock: (item: string, stock: number) =>
            set((state) => {
                state.itemStock[item] = stock;
                localStorage.setItem(stockStorageKey, JSON.stringify(state.itemStock));
            }),
        loadSavedData: () =>
            set((state) => {
                const storageItemPrices = getLocalStorageData(pricesStorageKey);
                console.log({ storageItemPrices });
                if (storageItemPrices) {
                    for (const item in storageItemPrices) {
                        console.log('storageItemPrices', item, storageItemPrices[item]);
                        if (storageItemPrices[item]) {
                            state.itemPrices[item] = storageItemPrices[item];
                        }
                    }
                }

                const storageItemStock = getLocalStorageData(stockStorageKey);
                console.log({ storageItemStock });
                if (storageItemStock) {
                    for (const item in storageItemStock) {
                        console.log('storageItemStock', item, storageItemStock[item]);
                        if (storageItemStock[item]) {
                            state.itemStock[item] = storageItemStock[item];
                        }
                    }
                }
            }),
    }))
);

function getLocalStorageData(storageKey: string): any {
    let data = {};
    const rawData = localStorage.getItem(storageKey);

    if (rawData) {
        try {
            data = JSON.parse(rawData);
        } catch (e) {
            console.error('UH OH! Data could not be loaded!', e);
            localStorage.removeItem(storageKey);
        }
    }

    return data;
}

export default useImbuementStore;
