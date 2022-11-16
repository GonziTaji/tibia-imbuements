import { useEffect } from 'react';
import { imbuementsPerSlot, imbuementTypesData, IMBUEMENT_POWER, IMBUEMENT_TYPE } from '../src/data';
import { ItemData } from '../src/types';
import useImbuementStore from '../src/hooks/useImbuementStore';

function formatGold(gold: number): string {
    return new Intl.NumberFormat('es-CL').format(gold) + ' gp';
}

export default function Home() {
    const { slots, itemPrices, changeImbuement, changeSlotQuantity, changePrice, loadPrices } = useImbuementStore();

    // Todo: load saved prices outside component or something. Just get rid of this lol
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
        <main>
            <article>
                <h1>Imbuements</h1>

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
                                    <th>Effect</th>
                                    {/* <th>Cost</th>
                                    <th>Item Cost</th>
                                    <th>Total</th> */}
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

                                        <td>
                                            <span>
                                                {imbuementTypesData[imbuement.type].effectValues[imbuement.power] +
                                                    '% '}

                                                {imbuementTypesData[imbuement.type].effectName}
                                            </span>
                                        </td>

                                        {/* <td>
                                            <span
                                                title={
                                                    pricePerPower[imbuement.power].price +
                                                    ' + ' +
                                                    pricePerPower[imbuement.power].noFailureFee +
                                                    ' (100%) '
                                                }
                                            >
                                                {formatGold(
                                                    pricePerPower[imbuement.power].price +
                                                        pricePerPower[imbuement.power].noFailureFee
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span>{formatGold(imbuement.itemsTotal)}</span>
                                        </td>

                                        <td>
                                            <span>{formatGold(imbuement.total)}</span>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <h2>Total: {formatGold(grandTotal)}</h2>
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
                            {itemData.item} <input type="number" value={itemData.quantity} disabled />
                            <input
                                type="number"
                                value={itemPrices[itemData.item]}
                                onChange={(e) => changePrice(itemData.item, parseInt(e.currentTarget.value))}
                            />
                            <span style={{ display: 'block', wordWrap: 'normal' }}>
                                ={formatGold(itemPrices[itemData.item] * itemData.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            </article>
        </main>
    );
}

interface ImbuementLineProps {
    total: number;
    setTotal: (value: number) => void;
    items: ItemData[];
    setItems: (value: ItemData[]) => void;
}

function ImbuementLine({ total, items, setItems, setTotal }: ImbuementLineProps) {}
