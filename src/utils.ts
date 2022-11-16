export function formatGold(gold: number): string {
    return new Intl.NumberFormat('es-CL').format(gold) + ' gp';
}
