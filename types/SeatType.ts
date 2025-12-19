// types/SeatType.ts
export enum SeatType {
  HARD_SEAT = 'HARD_SEAT',
  SOFT_SEAT = 'SOFT_SEAT',
  SOFT_SEAT_AIR_CONDITIONER = 'SOFT_SEAT_AIR_CONDITIONER',
  HARD_BED = 'HARD_BED',
  SOFT_BED = 'SOFT_BED',
  SOFT_BED_AIR_CONDITIONER = 'SOFT_BED_AIR_CONDITIONER'
}

// mapping tương đương field `private String text;`
const SeatTypeTextMap: Record<SeatType, string> = {
  [SeatType.HARD_SEAT]: 'Hard seat',
  [SeatType.SOFT_SEAT]: 'Soft seat',
  [SeatType.SOFT_SEAT_AIR_CONDITIONER]: 'Soft seat with air conditioner',
  [SeatType.HARD_BED]: 'Hard bed',
  [SeatType.SOFT_BED]: 'Soft bed',
  [SeatType.SOFT_BED_AIR_CONDITIONER]: 'Soft bed with air conditioner'
};

export namespace SeatType {
  // tương đương seatType.getText()
  export function getText(type: SeatType): string {
    return SeatTypeTextMap[type];
  }

  // tương đương static SeatType fromText(String text)
  export function fromText(text: string): SeatType | null {
    for (const [key, value] of Object.entries(SeatTypeTextMap)) {
      if (value === text) {
        return key as SeatType;
      }
    }
    return null;
  }
}
