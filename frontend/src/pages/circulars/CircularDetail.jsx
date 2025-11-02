import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert, Divider } from '@mui/material';
import { ArrowBack, InfoOutlined } from '@mui/icons-material';
import { getCircular } from '../../services/circulars.service';
import { useAuth } from '../../contexts/AuthContext';

const CircularDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const role = getUserRole();
  const isTeacher = role === 'teacher' || role === 'instructor';

  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backPath = isTeacher ? '/teacher/circulars' : '/student/circulars';

  const loadCircular = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCircular(id);
      setCircular(data);
    } catch (e) {
      console.error('Error fetching circular detail', e);
      setError('تعذر تحميل تفاصيل التعميم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCircular();
  }, [id]);

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>تفاصيل التعميم</Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(backPath)}>
          رجوع
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mr: 2 }}>جاري تحميل التفاصيل...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !circular ? (
        <Alert severity="warning">التعميم غير موجود</Alert>
      ) : (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>{circular.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={circular.status === 'sent' ? 'مرسل' : (circular.status === 'scheduled' ? 'مجدول' : 'مسودة')} size="small" color={circular.status === 'sent' ? 'success' : (circular.status === 'scheduled' ? 'warning' : 'default')} />
              {circular.show_on_homepage && <Chip label="ظاهر في الرئيسية" size="small" color="primary" />}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Content rendered as HTML */}
          <Box sx={{ mt: 2, '& p': { textAlign: 'right' } }}>
            {circular.content ? (
              <Typography component="div" dir="rtl" sx={{ textAlign: 'right' }}
                dangerouslySetInnerHTML={{ __html: circular.content }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <InfoOutlined fontSize="small" />
                <Typography variant="body2">لا يحتوي هذا التعميم على محتوى نصي.</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CircularDetail;