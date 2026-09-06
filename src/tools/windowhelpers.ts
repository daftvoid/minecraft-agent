export function countInContainer(window: any, itemId: number): number {
    let total = 0
    for (let i = 0; i < window.inventoryStart; i++) {
        const slot = window.slots[i]
        if (slot && slot.type === itemId) total += slot.count
    }
    return total
}
