import { useNavigate, useLocation } from 'react-router-dom';

export const useScrollToFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToFooter = (e) => {
    if (e) e.preventDefault();
    
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If footer not found (maybe on a page that doesn't have it, though Layout has it)
      // Or if we need to navigate first? Layout is on almost all routes.
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return scrollToFooter;
};
