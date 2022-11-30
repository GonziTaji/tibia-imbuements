import { IMBUEMENT_POWER } from '../data';
import { Imbuement } from '../types';
import powerGemPNG from '../../public/power_gem.png';
import powerlessGemPNG from '../../public/powerless_gem.png';
import Image from 'next/image';

interface PowerSelectorProps {
    imbuement: Imbuement;
    setPower: (power: number) => void;
}

export default function PowerSelector({ imbuement, setPower }: PowerSelectorProps) {
    const isChecked = (value: number) => value <= imbuement.power;

    return (
        <div style={{ textAlign: 'center' }}>
            {Object.entries(IMBUEMENT_POWER).map(([name, value]) => (
                <span style={{ cursor: 'pointer' }} key={name} onClick={() => setPower(value as any)}>
                    <Image
                        // width={20}
                        src={isChecked(value) ? powerGemPNG : powerlessGemPNG}
                        alt={`${isChecked(value) ? 'power' : 'powerless'}_gem_` + name}
                    />
                </span>
            ))}
        </div>
    );
}
