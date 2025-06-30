/* eslint-disable prettier/prettier */
// src/components/FeatureCard/FeatureCard.jsx
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <article className="feature-card">
      <div className="feature-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </article>
  );
};

export default FeatureCard;