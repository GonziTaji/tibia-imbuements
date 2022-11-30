import { useEffect } from 'react';
import { EQUIPEMENT_IMG, EQUIPEMENT_SLOT, imbuementsPerSlot, IMBUEMENT_POWER, IMBUEMENT_TYPE } from '../src/data';
import { ItemData } from '../src/types';
import useImbuementStore from '../src/hooks/useImbuementStore';
import { formatGold } from '../src/utils';
import ItemPriceList from '../src/components/ItemPriceList';
import ImbuementCostList from '../src/components/ImbuementCostList';
import styles from '../styles/Home.module.css';
import ItemStock from '../src/components/ItemStock';
import ItemsNeeded from '../src/components/ItemsNeeded';
import Image from 'next/image';
import PowerSelector from '../src/components/PowerSelector';
import backgroundWEBP from '../public/background.webp';
import background2PNG from '../public/background_2.png';

export default function Home() {
    const { slots, changeImbuement, loadSavedData } = useImbuementStore();

    useEffect(() => loadSavedData(), [loadSavedData]);

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

                <div
                    style={{
                        background: `url(${backgroundWEBP.src})`,
                        padding: '1rem',
                        border: '2px solid black',
                        boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                    }}
                >
                    {Object.keys(EQUIPEMENT_SLOT).map((slot) => (
                        <div className={styles.slotContainer} key={slot}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    paddingBottom: '0.5rem',
                                }}
                            >
                                <Image src={(EQUIPEMENT_IMG as any)[slot]} alt={slot} />

                                {slots[slot].imbuements.map((imbuement, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            border: '1px solid black',
                                            background: `url(${background2PNG.src})`,
                                            backgroundSize: 'cover',
                                        }}
                                    >
                                        <select
                                            onChange={(e) => changeType(slot, i, e.currentTarget.value as any)}
                                            value={imbuement.type}
                                        >
                                            <option key={IMBUEMENT_TYPE.None} value={IMBUEMENT_TYPE.None}>
                                                -- Empty
                                            </option>
                                            {imbuementsPerSlot[slot].map((value, i) => (
                                                <option key={i} value={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>

                                        <div>
                                            <PowerSelector
                                                imbuement={imbuement}
                                                setPower={(power) => changePower(slot, i, power)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </article>

            <ImbuementCostList />

            <ItemsNeeded />

            <ItemPriceList />

            <ItemStock />
        </main>
    );
}
