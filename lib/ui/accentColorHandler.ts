import { makeAutoObservable } from 'mobx';
import { WeekView } from '../app/weeksHandler';

export type AccentColor = WeekView | 'neutral' | 'off'

const accentColorHandler = makeAutoObservable({
  accentColor: 'off' as AccentColor,
  setAccentColor(accent: AccentColor) { this.accentColor = accent }
})

export default accentColorHandler