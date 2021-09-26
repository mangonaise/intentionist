import { makeAutoObservable } from 'mobx';
import { WeekView } from '../app/WeeksHandler';

export type AccentColor = WeekView | 'neutral' | 'off'

const accentColor = makeAutoObservable({
  current: 'off' as AccentColor,
  set(accent: AccentColor) { this.current = accent }
})

export default accentColor