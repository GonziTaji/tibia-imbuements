import { useEffect } from 'react';
import { EQUIPEMENT_SLOT, imbuementsPerSlot, imbuementTypesData, IMBUEMENT_POWER, IMBUEMENT_TYPE } from '../src/data';
import { ItemData } from '../src/types';
import useImbuementStore from '../src/hooks/useImbuementStore';
import { formatGold } from '../src/utils';
import ItemPriceList from '../src/components/ItemPriceList';
import ImbuementCostList from '../src/components/ImbuementCostList';
import styles from '../styles/Home.module.css';

const ImbuementMaxSlot = {
    [EQUIPEMENT_SLOT.Helmet]: 2,
    [EQUIPEMENT_SLOT.Armor]: 3,
    [EQUIPEMENT_SLOT.Weapon]: 3,
    [EQUIPEMENT_SLOT.Shield]: 1,
    [EQUIPEMENT_SLOT.Boots]: 1,
};

export default function Home() {
    const { slots, itemPrices, changeImbuement, changeSlotQuantity, loadPrices } = useImbuementStore();

    useEffect(() => loadPrices(), [loadPrices]);

    const allImbuements = Object.values(slots).flatMap((slot) => slot.imbuements);

    const changeType = (slot: string, index: number, type: string) =>
        changeImbuement(slot, index, slots[slot].imbuements[index].power, type);

    const changePower = (slot: string, index: number, power: number) =>
        changeImbuement(slot, index, power, slots[slot].imbuements[index].type);

    const items: ItemData[] = [];
    let grandTotal = 0;

    for (const imbuement of allImbuements) {
        if (imbuement.type !== IMBUEMENT_TYPE.None) {
            grandTotal += imbuement.total;
        }

        for (const itemData of imbuement.items) {
            const index = items.findIndex((_item) => _item.item === itemData.item);

            if (index === -1) {
                items.push({
                    item: itemData.item,
                    quantity: itemData.quantity,
                });
            } else {
                items[index].quantity += itemData.quantity;
            }
        }
    }

    return (
        <main style={{ padding: 15, paddingTop: 0 }}>
            <article style={{ width: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Imbuements</h1>
                    <h2>Total: {formatGold(grandTotal)}</h2>
                </div>

                {Object.keys(EQUIPEMENT_SLOT).map((slot) => (
                    <div
                        className={styles.slotContainer}
                        key={slot}
                        style={{
                            border: '1px solid rgba(0,0,0,0.5)',
                            boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                            padding: '1rem 2rem 0.5rem 2rem',
                            marginBottom: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    minWidth: '5rem',
                                }}
                            >
                                <b>{slot.toUpperCase()}</b>
                            </span>

                            <div>
                                <label htmlFor="slot-quantity">Slots: </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={ImbuementMaxSlot[slot]}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => changeSlotQuantity(slot as any, Number(e.currentTarget.value))}
                                    value={slots[slot].slotQuantity}
                                />
                            </div>
                        </div>

                        <hr />

                        <div>
                            {slots[slot].imbuements.map((imbuement, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.2rem', paddingBottom: '0.5rem' }}>
                                    <select
                                        onChange={(e) => changeType(slot, i, e.currentTarget.value as any)}
                                        value={imbuement.type}
                                    >
                                        <option key={IMBUEMENT_TYPE.None} value={IMBUEMENT_TYPE.None}>
                                            -- None
                                        </option>
                                        {imbuementsPerSlot[slot].map((value, i) => (
                                            <option key={i} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>

                                    <select onChange={(e) => changePower(slot, i, e.currentTarget.value as any)}>
                                        {Object.entries(IMBUEMENT_POWER).map(([name, value]) => (
                                            <option key={name} value={value}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </article>

            <ImbuementCostList />

            <article>
                <h1>Items needed</h1>

                <ul style={{ margin: 0, padding: 0 }}>
                    {items.map((itemData, i) => (
                        <li
                            key={i}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '9rem min-content 1fr 1fr',
                            }}
                        >
                            {itemData.item}
                            <input
                                type="text"
                                value={'' + itemData.quantity + ' x ' + itemPrices[itemData.item]}
                                disabled
                                readOnly
                            />
                            <span style={{ display: 'block', wordWrap: 'normal' }}>
                                &nbsp;=&nbsp;{formatGold(itemPrices[itemData.item] * itemData.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            </article>

            <ItemPriceList />
        </main>
    );
}
