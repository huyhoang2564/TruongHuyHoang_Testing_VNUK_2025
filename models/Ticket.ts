import type { Station } from '../types/Station';
import type { SeatType } from '../types/SeatType';

export type Ticket = {
  departDate: Date;
  departFrom: Station;
  arriveAt: Station;
  seatType: SeatType;
  amount: number;
};
