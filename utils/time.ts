/**
 * HH:mm:ss形式の時間を秒に変換する
 * @param time (例: 10:05:02)
 */
export function toSeconds(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 60 * 60 + minutes * 60 + seconds;
}

const pad00 = (v: number) => String(v).padStart(2, '0');

/**
 * 131 -> 00:02:11
 * @param seconds
 */
export function toHHmmss(seconds: number): string {
  const hour = (seconds / (60 * 60)) | 0;
  const min = ((seconds % (60 * 60)) / 60) | 0;
  const sec = seconds % 60;
  return `${pad00(hour)}:${pad00(min)}:${pad00(sec)}`;
}

/**
 * HH:mm:ss形式の時間を日本語の最適表記に変換する
 * 0～59秒はそのまま
 * 1分以上は秒を省略
 * @param time (例: 10:05:02)
 */
export function toJapanese(time: string): string {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return [hours && `${hours}時間`, minutes && `${minutes}分`, hours === 0 && minutes === 0 && `${seconds}秒`]
    .filter(x => x)
    .join('');
}

/**
 * 秒を日本語の最適表記に変換する
 * 0～59秒はそのまま
 * 1分以上は秒を省略
 * @param seconds
 */
export function toJapaneseFromSecond(seconds: number): string {
  return toJapanese(toHHmmss(seconds));
}
