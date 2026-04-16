export const LOCATIONS = [
  "Tất cả thành phố",
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
  "Thừa Thiên Huế",
  "Bắc Ninh",
  "Quảng Ninh",
  "Thanh Hóa",
  "Nghệ An",
  "Lâm Đồng",
  "Other",
] as const;

export type Location = (typeof LOCATIONS)[number];
