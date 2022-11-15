type NonNegativeInteger<T extends number> = number extends T
  ? never
  : `${T}` extends `-${string}` | `${string}.${string}`
  ? never
  : T;

export class ChangeCoinDto {
  public amount: number;

  public type: 'BUY GAME' | 'CHARGE';
}
