export function formatLogDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${month} / ${day} / ${year}`;
}

export function formatLogMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
