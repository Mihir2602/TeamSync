/* eslint-disable prettier/prettier */
// src/components/Testimonials/Testimonials.jsx
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Hackathon Winner, TechGeeks 2023',
    content: 'TeamSync transformed how our team collaborated during hackathons. We went from chaotic WhatsApp messages to structured updates that kept everyone aligned.',
    avatar: '👩‍💻'
  },
  {
    id: 2,
    name: 'Rahul Patel',
    role: 'Team Lead, CodeCrushers',
    content: 'The progress tracking features helped us identify bottlenecks early. Our productivity increased by 40% after switching to TeamSync.',
    avatar: '🧑‍💻'
  },
  {
    id: 3,
    name: 'Ananya Gupta',
    role: 'CS Student, IIT Delhi',
    content: 'As a mentor for multiple teams, TeamSync gives me perfect visibility into each team\'s progress without overwhelming message threads.',
    avatar: '👩‍🏫'
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <p>&quot;{testimonial.content}&quot;</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-info">
                  <h3 className="testimonial-name">{testimonial.name}</h3>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;