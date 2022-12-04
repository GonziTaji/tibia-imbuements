import { IMBUEMENT_POWER, IMBUEMENT_TYPE, ITEM, pricePerPower } from '../data';
import useImbuementStore from '../hooks/useImbuementStore';
import { Imbuement } from '../types';
import { formatGold } from '../utils';
import styles from '../../styles/CostList.module.scss';
import { Fragment, useEffect, useMemo, useState } from 'react';

const filledArray = (length: number, value: any) => new Array(length).fill(value);

export default function ImbuementCostList() {
    const { slots } = useImbuementStore();

    const groupedImbuements: (Imbuement & { quantity: number })[] = useMemo(() => {
        const groupedImbuements: (Imbuement & { quantity: number })[] = [];
        for (const slot of Object.values(slots)) {
            for (const imbuement of slot.imbuements) {
                if (imbuement.type !== IMBUEMENT_TYPE.None) {
                    // could be better but imbuement list is very short
                    const index = groupedImbuements.findIndex(
                        (group) => group.power === imbuement.power && group.type === imbuement.type
                    );

                    if (index !== -1) {
                        groupedImbuements[index].quantity++;
                    } else {
                        groupedImbuements.push({
                            ...imbuement,
                            quantity: 1,
                        });
                    }
                }
            }
        }

        return groupedImbuements;
    }, [slots]);

    const [collapsed, setCollapsed] = useState<boolean[]>(filledArray(groupedImbuements.length, true));

    useEffect(() => {
        setCollapsed((state) => {
            if (state.length !== groupedImbuements.length) {
                return filledArray(groupedImbuements.length, true);
            }

            return state;
        });
    }, [groupedImbuements]);

    const changeCollapsed = (index: number, collapsedState: boolean) =>
        setCollapsed((collapsed) => {
            const newCollapsed = [...collapsed];
            newCollapsed[index] = collapsedState;
            return newCollapsed;
        });

    return (
        <article>
            <h1>Imbuement Price detail</h1>
            <table className={styles.costTable}>
                <thead>
                    <tr>
                        <th>Imbuement</th>
                        <th>Unit total</th>
                        <th>Quantity</th>
                        <th>Total (Items)</th>
                        <th>Total (Gold T.)</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {groupedImbuements.map((imbuement, i) => (
                        <Fragment key={i}>
                            <tr key={i}>
                                <td>
                                    {Object.keys(IMBUEMENT_POWER)[imbuement.power]} {imbuement.type}
                                </td>
                                <td className={styles.number}>{formatGold(imbuement.itemsTotal)}</td>

                                <td style={{ textAlign: 'center' }}>{imbuement.quantity}</td>

                                <td className={styles.number}>{formatGold(imbuement.total * imbuement.quantity)}</td>

                                <td className={styles.number}>
                                    {formatGold(imbuement.totalWithGoldToken * imbuement.quantity)}
                                </td>

                                <td>
                                    <button onClick={() => changeCollapsed(i, !collapsed[i])}>
                                        {collapsed[i] ? 'show details' : 'hide details'}
                                    </button>
                                </td>
                            </tr>
                            <tr style={{ paddingBottom: '1rem' }}>
                                <td colSpan={5}>
                                    <div
                                        style={{
                                            marginLeft: '2rem',
                                            height: collapsed[i] ? '0' : 'unset',
                                            overflow: 'hidden',
                                            boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                                            border: '1px solid rgba(0,0,0,0.5)',
                                            marginBottom: collapsed[i] ? '0.1rem' : '1rem',
                                        }}
                                    >
                                        <table style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>{collapsed[i]} Cost</th>
                                                    <th>100% fee</th>
                                                    <th>Item Cost</th>
                                                    <th>Gold Token Cost</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td className={styles.number}>
                                                        {formatGold(pricePerPower[imbuement.power].price)}
                                                    </td>
                                                    <td className={styles.number}>
                                                        {formatGold(pricePerPower[imbuement.power].noFailureFee)}
                                                    </td>
                                                    <td className={styles.number}>
                                                        {formatGold(imbuement.itemsTotal)}
                                                    </td>
                                                    <td className={styles.number}>
                                                        {formatGold(imbuement.goldTokenValue)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </article>
    );
}
