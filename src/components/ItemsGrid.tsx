import { Fragment, useMemo, useState } from 'react';
import { ITEM } from '../data';
import useImbuementStore from '../hooks/useImbuementStore';
import { ItemData } from '../types';
import { formatGold } from '../utils';
import styles from '../../styles/ItemsGrid.module.scss';
import backgroundWEBP from '../../public/background.webp';
import headerBgPNG from '../../public/header_bg.png';

export default function ItemPriceList() {
    const { changePrice, itemPrices, itemsNeeded, goldTokenQuantity, itemStock, changeStock } = useImbuementStore();
    const [seeAllItems, setSeeAllItems] = useState(false);

    const items = useMemo(() => {
        const _items: ItemData[] = [];

        if (goldTokenQuantity) {
            _items.push({
                item: ITEM.GoldToken,
                quantity: goldTokenQuantity,
            });
        }
        console.log(itemsNeeded);
        _items.push(...itemsNeeded);

        if (seeAllItems) {
            for (const itemNotNeeded of Object.values(ITEM)) {
                // console.log('item not needed', itemNotNeeded);
                // console.log(_items);
                if (!_items.find((x) => x.item === itemNotNeeded)) {
                    _items.push({
                        item: itemNotNeeded,
                        quantity: 0,
                    });
                }
            }
        }

        return _items;
    }, [itemsNeeded, seeAllItems, goldTokenQuantity]);

    return (
        <article
            className={styles.container}
            style={{
                background: `url(${backgroundWEBP.src})`,
            }}
        >
            <span
                className={styles.header}
                style={{
                    background: `url(${headerBgPNG.src})`,
                }}
            >
                Item Prices
            </span>

            <main>
                <div className={styles.checkboxContainer}>
                    <input
                        id="seeAllCheckbox"
                        type="checkbox"
                        checked={seeAllItems}
                        onChange={(ev) => setSeeAllItems(ev.currentTarget.checked)}
                    />
                    <label htmlFor="seeAllCheckbox">List all items</label>
                    <br />
                    <small>If checked, list every item that is needed for an imbuement</small>
                </div>

                <table className={styles.itemGridTable} border={0}>
                    <thead>
                        <tr className={styles.top}>
                            <th className={styles.itemname} colSpan={5}>
                                Item Name
                            </th>
                        </tr>
                        <tr className={styles.bottom}>
                            <th style={{ width: '2rem' }}></th>
                            <th>Price</th>
                            <th>Quantity&nbsp;</th>
                            <th>In power</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map(({ item, quantity }, i) => (
                            <Fragment key={i}>
                                <tr className={styles.top}>
                                    <td className={styles.itemname} colSpan={5}>
                                        {item}
                                    </td>
                                </tr>

                                <tr className={styles.bottom} key={item}>
                                    <td></td>
                                    <td>
                                        <input
                                            id={'price_' + item}
                                            className={styles.price}
                                            type="number"
                                            value={itemPrices[item]}
                                            onChange={(e) => changePrice(item, parseInt(e.currentTarget.value))}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={styles.quantity}
                                            type="text"
                                            readOnly
                                            disabled
                                            value={quantity}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={styles.quantity}
                                            id={'stock_' + item}
                                            type="number"
                                            value={itemStock[item]}
                                            onChange={(e) => changeStock(item, parseInt(e.currentTarget.value))}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className={styles.total}
                                            readOnly
                                            disabled
                                            value={formatGold(
                                                quantity ? (quantity - itemStock[item]) * itemPrices[item] : 0
                                            )}
                                        />
                                    </td>
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </main>
        </article>
    );
}
