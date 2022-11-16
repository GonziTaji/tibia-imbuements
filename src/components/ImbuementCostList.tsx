import { IMBUEMENT_POWER, IMBUEMENT_TYPE, pricePerPower } from '../data';
import useImbuementStore from '../hooks/useImbuementStore';
import { Imbuement } from '../types';
import { formatGold } from '../utils';
import styles from '../CostList.module.scss';

export default function ImbuementCostList() {
    const { slots } = useImbuementStore();

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

    return (
        <article>
            <h1>Imbuement Price detail</h1>
            <table className={styles.costTable}>
                <thead>
                    <tr>
                        <th>Imbuement</th>
                        <th>Cost</th>
                        <th>Items</th>
                        <th>Subtotal</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    {groupedImbuements.map((imbuement, i) => (
                        <tr key={i}>
                            <td>
                                {Object.keys(IMBUEMENT_POWER)[imbuement.power]} {imbuement.type}
                            </td>
                            <td
                                className={styles.number}
                                title={
                                    pricePerPower[imbuement.power].price +
                                    ' + ' +
                                    pricePerPower[imbuement.power].noFailureFee +
                                    ' (100%) '
                                }
                            >
                                {formatGold(
                                    pricePerPower[imbuement.power].price + pricePerPower[imbuement.power].noFailureFee
                                )}
                            </td>

                            <td className={styles.number}>{formatGold(imbuement.itemsTotal)}</td>

                            <td className={styles.number}>{formatGold(imbuement.total)}</td>

                            <td style={{ textAlign: 'center' }}>{imbuement.quantity}</td>

                            <td className={styles.number}>{formatGold(imbuement.total * imbuement.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </article>
    );
}
