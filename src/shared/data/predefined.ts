// iterate 00:00 , 00:15 , 00:30, 00:45 01:00 ... 23:45

const MINUTES = new Array(4).fill(0).map((_, i) => i * 15)
const HOURS = new Array(24).fill(0).map((_, i) => i)

//!TODO bunu jsona cevir ve o sekilde kullan
export const MEAL_HOURS = HOURS.flatMap(h => MINUTES.map(m => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`))

