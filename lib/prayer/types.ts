import type { Method } from "./engine";

export type Option = { id: string; name: string };

export type PlaceInfo = {
  id: string;
  name: string; // ilçe
  city: string; // il / şehir
  country: string;
  lat: number;
  lon: number;
  tz: string;
  method: Method;
  qibla: number; // derece, kuzeyden saat yönünde
};

export type DayRow = {
  date: string; // YYYY-MM-DD
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  hicri: string;
  source: "diyanet" | "hesaplama";
};

export type MonthResponse = {
  place: PlaceInfo;
  month: string; // YYYY-MM
  today: string; // YYYY-MM-DD (yerin saat diliminde, sunucu anı)
  days: DayRow[];
  after: DayRow | null; // sonraki ayın ilk günü (yarının imsakı için)
};

export type InitialLists = {
  countries: Option[];
  regions: Option[];
  districts: Option[];
  countryId: string;
  regionId: string;
  districtId: string;
};
