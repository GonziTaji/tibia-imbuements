import { useEffect } from 'react';
import { imbuementsPerSlot, imbuementTypesData, IMBUEMENT_POWER, IMBUEMENT_TYPE } from '../src/data';
import { ItemData } from '../src/types';
import useImbuementStore from '../src/hooks/useImbuementStore';
import { formatGold } from '../src/utils';
import ItemPriceList from '../src/components/ItemPriceList';
import ImbuementCostList from '../src/components/ImbuementCostList';

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
            <article>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Imbuements</h1>
                    <h2>Total: {formatGold(grandTotal)}</h2>
                </div>

                {Object.entries(imbuementsPerSlot).map(([slot, availableTypes]) => (
                    <div key={slot} style={{ display: 'flex' }}>
                        <div style={{ border: '1px solid black', marginLeft: '0.2rem', padding: '0.2rem' }}>
                            <span
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    minWidth: '5rem',
                                }}
                            >
                                <b>{slot.toUpperCase()}</b>
                            </span>
                            <label htmlFor="slot-quantity">Slots: </label>
                            <input
                                type="number"
                                min={0}
                                max={3}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => changeSlotQuantity(slot as any, Number(e.currentTarget.value))}
                                value={slots[slot].slotQuantity}
                            />
                        </div>

                        <table style={{ marginBottom: '1rem' }}>
                            <thead>
                                <tr>
                                    <th>Power</th>
                                    <th>Type</th>
                                </tr>
                            </thead>

                            <tbody>
                                {slots[slot].imbuements.map((imbuement, i) => (
                                    <tr key={i}>
                                        <td>
                                            <select
                                                onChange={(e) => changeType(slot, i, e.currentTarget.value as any)}
                                                value={imbuement.type}
                                            >
                                                <option key={IMBUEMENT_TYPE.None} value={IMBUEMENT_TYPE.None}>
                                                    -- None
                                                </option>
                                                {availableTypes.map((value, i) => (
                                                    <option key={i} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <select
                                                onChange={(e) => changePower(slot, i, e.currentTarget.value as any)}
                                            >
                                                {Object.entries(IMBUEMENT_POWER).map(([name, value]) => (
                                                    <option key={name} value={value}>
                                                        {name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <ImbuementCostList />
            </article>

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
                                ={formatGold(itemPrices[itemData.item] * itemData.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            </article>

            <ItemPriceList />
        </main>
    );
}
