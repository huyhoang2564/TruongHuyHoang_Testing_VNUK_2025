// types/Station.ts
export enum Station {
  SAI_GON = 'SAI_GON',
  PHAN_THIET = 'PHAN_THIET',
  HUE = 'HUE',
  DA_NANG = 'DA_NANG',
  QUANG_NGAI = 'QUANG_NGAI',
  NHA_TRANG = 'NHA_TRANG'
}

// mapping tương đương field `private String text`
const StationTextMap: Record<Station, string> = {
  [Station.SAI_GON]: 'Sài Gòn',
  [Station.PHAN_THIET]: 'Phan Thiết',
  [Station.HUE]: 'Huế',
  [Station.DA_NANG]: 'Đà Nẵng',
  [Station.QUANG_NGAI]: 'Quảng Ngãi',
  [Station.NHA_TRANG]: 'Nha Trang'
};

export namespace Station {
  // tương đương station.getText()
  export function getText(station: Station): string {
    return StationTextMap[station];
  }

  // tương đương static Station fromText(String text)
  export function fromText(text: string): Station | null {
    for (const [key, value] of Object.entries(StationTextMap)) {
      if (value === text) {
        return key as Station;
      }
    }
    return null;
  }
}
