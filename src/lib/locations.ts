/**
 * Vietnam's 34 administrative units after the 2025 merger (Nghị quyết 60-NQ/TW).
 * Mirror of `web-backend/src/databases/vietnam-provinces.ts` — keep in sync.
 *
 * Display order: 6 cities first (more searched), then 28 provinces alphabetical-ish
 * by region (North → Central → South) to match how users mentally browse.
 */
export const LOCATIONS = [
  "Tất cả thành phố",
  // 6 thành phố trực thuộc TW
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Cần Thơ",
  "Huế",
  // 28 tỉnh
  "Lai Châu",
  "Điện Biên",
  "Sơn La",
  "Lạng Sơn",
  "Cao Bằng",
  "Tuyên Quang",
  "Lào Cai",
  "Thái Nguyên",
  "Phú Thọ",
  "Bắc Ninh",
  "Hưng Yên",
  "Ninh Bình",
  "Quảng Ninh",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Trị",
  "Quảng Ngãi",
  "Gia Lai",
  "Khánh Hòa",
  "Lâm Đồng",
  "Đắk Lắk",
  "Đồng Nai",
  "Tây Ninh",
  "Vĩnh Long",
  "Đồng Tháp",
  "Cà Mau",
  "An Giang",
] as const;

export type Location = (typeof LOCATIONS)[number];
