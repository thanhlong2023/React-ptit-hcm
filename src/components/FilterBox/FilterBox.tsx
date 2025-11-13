import { useState } from "react";
import styles from "./FilterBox.module.css";

interface FilterBoxProps {
  onFilter: (filters: {
    sortBy: string;
    type: string;
    genre: string;
    country: string;
    language: string;
    year: string;
  }) => void;
}

function FilterBox({ onFilter }: FilterBoxProps) {
  const [sortBy, setSortBy] = useState("Mới Lên Sóng");
  const [type, setType] = useState("Tất cả");
  const [genre, setGenre] = useState("Phim Lẻ");
  const [country, setCountry] = useState("Tất cả");
  const [language, setLanguage] = useState("Tất cả");
  const [year, setYear] = useState("Tất cả");

  const handleFilter = () => {
    onFilter({
      sortBy,
      type,
      genre,
      country,
      language,
      year,
    });
  };

  return (
    <div className={styles.filterContainer}>
        {/* Sắp xếp */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Sắp xếp</label>
          <select
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Mới Lên Sóng</option>
            <option>Phổ biến</option>
            <option>Mới cập nhật</option>
          </select>
        </div>

        {/* Hình thức */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Hình thức</label>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Phim lẻ</option>
            <option>Phim bộ</option>
          </select>
        </div>

        {/* Thể loại */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Thể loại</label>
          <select
            className={styles.select}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option>Phim Lẻ</option>
            <option>Hành động</option>
            <option>Kinh dị</option>
            <option>Hài hước</option>
          </select>
        </div>

        {/* Quốc gia */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Quốc gia</label>
          <select
            className={styles.select}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Việt Nam</option>
            <option>Hàn Quốc</option>
            <option>Mỹ</option>
            <option>Nhật Bản</option>
          </select>
        </div>

        {/* Ngôn ngữ */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Ngôn ngữ</label>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Việt</option>
            <option>Anh</option>
            <option>Hàn</option>
          </select>
        </div>

        {/* Năm phát hành */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Năm phát hành</label>
          <select
            className={styles.select}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option>Tất cả</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>

        {/* Nút duyệt phim */}
        <button className={styles.button} onClick={handleFilter}>
          Duyệt phim
        </button>
      </div>
  );
}

export default FilterBox;
