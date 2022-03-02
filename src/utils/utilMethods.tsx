// Generate random integer string

const chars = '1234567890';
export function generateId(length: number) : number {
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return parseInt(result);
}