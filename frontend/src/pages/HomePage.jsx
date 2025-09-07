import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroBanner from '../components/home/HeroBanner';
import CourseCollections from '../components/home/CourseSlider';
import TestimonialsSection from '../components/home/TestimonialsSection';
import LearningMethodsSection from '../components/home/LearningMethodsSection';
import MotionSeparator from '../components/home/MotionSeparator';


const HomePage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Helmet>
        <title>الرئيسية | منصة معهد التطوير المهني العالي للتدريب</title>
        <meta 
          name="description" 
          content="منصة معهد التطوير المهني العالي للتدريب - منصة تعليمية متكاملة تقدم دورات تدريبية احترافية في مختلف المجالات." 
        />
        <meta name="keywords" content="تعليم عن بعد, دورات تدريبية, تعلم اونلاين, شهادات معتمدة, تطوير مهني" />
      </Helmet>
      
      {/* Header */}
      <Header />
      
      <Box component="main" sx={{ flex: 1 }}>
        {/* Hero Banner Section */}
        <Box component="section" id="home">
          <HeroBanner />
        </Box>

        {/* Learning Methods Section */}
        <Box component="section" id="learning-methods">
          <LearningMethodsSection />
        </Box>

        {/* Motion Separator - Stats & Partners */}
        <Box component="section" id="stats-separator">
          <MotionSeparator />
        </Box>
 
        {/* Course Collections Section */}
        <Box component="section" id="course-collections" sx={{ bgcolor: 'background.default' }}>
          <CourseCollections />
        </Box>

        {/* Testimonials Section */}
        <Box component="section" id="testimonials" sx={{ bgcolor: 'background.default' }}>
          <TestimonialsSection />
        </Box>

      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
