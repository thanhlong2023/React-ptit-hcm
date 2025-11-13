import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PersonCard.module.css";

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

interface PersonCardProps {
  person: Person;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const navigate = useNavigate();
  const imageUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : "/no-avatar.png"; // A placeholder image

  const handleCardClick = () => {
    navigate(`/person/${person.id}`);
  };

  return (
    <div
      className={styles.personCard}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={person.name} loading="lazy" />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{person.name}</p>
        <p className={styles.department}>{person.known_for_department}</p>
      </div>
    </div>
  );
};

export default PersonCard;
