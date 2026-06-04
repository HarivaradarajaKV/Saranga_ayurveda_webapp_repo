import { useNavigate, useLocation } from 'react-router-dom';

export const useScrollToFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToFooter = (e) => {
    if (e) e.preventDefault();
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToFooter: true } });
    } else {
      const footer = document.getElementById('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return scrollToFooter;
};
