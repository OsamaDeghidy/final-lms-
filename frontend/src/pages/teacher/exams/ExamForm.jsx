import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, MenuItem, Switch, FormControlLabel, Grid, CircularProgress, Alert } from '@mui/material';
import { Assessment, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';
import { courseAPI } from '../../../services/courseService';

const ExamForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { examId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    module: '',
    time_limit: '',
    pass_mark: 60,
    total_points: 100,
    is_final: false,
    is_active: true,
    allow_multiple_attempts: false,
    max_attempts: 1,
    show_answers_after: false,
    randomize_questions: false,
    start_date: '',
    end_date: ''
  });

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch courses and exam data on component mount
  useEffect(() => {
    fetchCourses();
    if (isEdit && examId) {
      fetchExam();
    }
  }, [isEdit, examId]);

  // Debug effect to log form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Debug effect to log modules changes
  useEffect(() => {
    console.log('Modules changed:', modules);
  }, [modules]);

  // Fetch modules when course changes
  useEffect(() => {
    console.log('Course changed to:', formData.course); // Debug log
    if (formData.course) {
      fetchModules(formData.course);
    } else {
      console.log('No course selected, clearing modules'); // Debug log
      setModules([]);
    }
  }, [formData.course]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...'); // Debug log
      const response = await courseAPI.getCourses();
      console.log('Courses response:', response); // Debug log
      
      // Ensure coursesList is always an array
      let coursesList = [];
      if (Array.isArray(response)) {
        coursesList = response;
      } else if (response && Array.isArray(response.results)) {
        coursesList = response.results;
      } else if (response && typeof response === 'object') {
        coursesList = response.results || response.courses || [];
      }
      
      // Ensure it's an array
      if (!Array.isArray(coursesList)) {
        console.warn('Courses is not an array, converting to empty array:', coursesList);
        coursesList = [];
      }
      
      console.log('Final courses list:', coursesList); // Debug log
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('حدث خطأ في تحميل الدورات');
      setCourses([]);
    }
  };

  const fetchModules = async (courseId) => {
    try {
      console.log('Fetching modules for course:', courseId); // Debug log
      
      // Try getCourseModules first
      let modulesResponse;
      try {
        modulesResponse = await courseAPI.getCourseModules(courseId);
        console.log('Modules response from getCourseModules:', modulesResponse); // Debug log
      } catch (modulesErr) {
        console.log('getCourseModules failed, trying getCourse:', modulesErr); // Debug log
        // Fallback to getCourse
        const courseResponse = await courseAPI.getCourse(courseId);
        console.log('Course response:', courseResponse); // Debug log
        modulesResponse = { results: courseResponse.modules || [] };
      }
      
      // Ensure modulesList is always an array
      let modulesList = [];
      if (Array.isArray(modulesResponse)) {
        modulesList = modulesResponse;
      } else if (modulesResponse && Array.isArray(modulesResponse.results)) {
        modulesList = modulesResponse.results;
      } else if (modulesResponse && Array.isArray(modulesResponse.modules)) {
        modulesList = modulesResponse.modules;
      } else if (modulesResponse && typeof modulesResponse === 'object') {
        // If it's an object, try to extract modules from it
        modulesList = modulesResponse.modules || modulesResponse.results || [];
      }
      
      // Ensure it's an array
      if (!Array.isArray(modulesList)) {
        console.warn('Modules is not an array, converting to empty array:', modulesList);
        modulesList = [];
      }
      
      console.log('Final modules list:', modulesList); // Debug log
      setModules(modulesList);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
    }
  };

  const fetchExam = async () => {
    try {
      setLoading(true);
      const exam = await examAPI.getExam(examId);
      console.log('Fetched exam data:', exam); // Debug log
      
      const courseId = exam.course?.id?.toString() || exam.course?.toString() || '';
      const moduleId = exam.module?.id?.toString() || exam.module?.toString() || '';
      
      setFormData({
        title: exam.title || '',
        description: exam.description || '',
        course: courseId,
        module: moduleId,
        time_limit: exam.time_limit?.toString() || '',
        pass_mark: exam.pass_mark?.toString() || '60',
        total_points: exam.total_points?.toString() || '100',
        is_final: exam.is_final || false,
        is_active: exam.is_active !== undefined ? exam.is_active : true,
        allow_multiple_attempts: exam.allow_multiple_attempts || false,
        max_attempts: exam.max_attempts?.toString() || '1',
        show_answers_after: exam.show_answers_after || false,
        randomize_questions: exam.randomize_questions || false,
        start_date: formatDateTimeForInput(exam.start_date),
        end_date: formatDateTimeForInput(exam.end_date)
      });
      
      console.log('Set form data:', { courseId, moduleId }); // Debug log
      
      // Fetch modules for the course if course exists
      if (courseId) {
        await fetchModules(courseId);
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('حدث خطأ في تحميل بيانات الامتحان');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDateTimeForAPI = (dateTimeString) => {
    if (!dateTimeString) return null;
    // Convert local datetime to ISO string for API
    const date = new Date(dateTimeString);
    return date.toISOString();
  };

  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    // Convert ISO string to local datetime for input field
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      // Validate dates
      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        
        if (startDate >= endDate) {
          setError('تاريخ البداية يجب أن يكون قبل تاريخ الانتهاء');
          setSaving(false);
          return;
        }
      }

      const examData = {
        ...formData,
        course: parseInt(formData.course),
        module: formData.module ? parseInt(formData.module) : null,
        time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
        pass_mark: parseFloat(formData.pass_mark),
        total_points: parseInt(formData.total_points),
        max_attempts: parseInt(formData.max_attempts),
        start_date: formatDateTimeForAPI(formData.start_date),
        end_date: formatDateTimeForAPI(formData.end_date)
      };

      if (isEdit) {
        await examAPI.updateExam(examId, examData);
      } else {
        await examAPI.createExam(examData);
      }

      navigate('/teacher/exams');
    } catch (err) {
      console.error('Error saving exam:', err);
      setError('حدث خطأ في حفظ الامتحان');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} /> 
          {isEdit ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField 
                label="عنوان الامتحان" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth 
                required 
                variant="outlined" 
                sx={{ minWidth: 400 }}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField 
                select 
                label="الدورة" 
                name="course"
                value={formData.course || ''}
                onChange={handleInputChange}
                fullWidth 
                required 
                variant="outlined" 
                sx={{ minWidth: 300 }}
                helperText={formData.course ? `محدد: ${Array.isArray(courses) && courses.find(c => c.id.toString() === formData.course)?.title || 'غير معروف'}` : ''}
              >
                {Array.isArray(courses) && courses.map((course) => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField 
                select 
                label="الوحدة (اختياري)" 
                name="module"
                value={formData.module || ''}
                onChange={handleInputChange}
                fullWidth 
                variant="outlined" 
                sx={{ minWidth: 250 }}
                helperText={
                  formData.module 
                    ? `محدد: ${Array.isArray(modules) && modules.find(m => m.id.toString() === formData.module)?.name || 'غير معروف'}` 
                    : formData.course && Array.isArray(modules) && modules.length > 0 
                      ? `${modules.length} وحدة متاحة` 
                      : formData.course 
                        ? 'جاري تحميل الوحدات...' 
                        : 'اختر دورة أولاً'
                }
                disabled={!formData.course}
                InputProps={{
                  endAdornment: formData.course && Array.isArray(modules) && modules.length === 0 && (
                    <CircularProgress size={20} />
                  )
                }}
              >
                <MenuItem value="">بدون</MenuItem>
                {Array.isArray(modules) && modules.map((module) => (
                  <MenuItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField 
                label="وصف الامتحان" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                minRows={4}
                variant="outlined"
                sx={{ minWidth: 500 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                label="الوقت بالدقائق" 
                name="time_limit"
                type="number" 
                value={formData.time_limit}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 1 }}
                sx={{ minWidth: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                label="درجة النجاح (%)" 
                name="pass_mark"
                type="number" 
                value={formData.pass_mark}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{ minWidth: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                label="إجمالي النقاط"
                name="total_points"
                type="number" 
                value={formData.total_points}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 1 }}
                sx={{ minWidth: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                label="الحد الأقصى للمحاولات" 
                name="max_attempts"
                type="number" 
                value={formData.max_attempts}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 1 }}
                sx={{ minWidth: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="تاريخ ووقت البداية"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 250 }}
                helperText="اختر التاريخ والوقت لبداية الامتحان"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="تاريخ ووقت الانتهاء"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 250 }}
                helperText="اختر التاريخ والوقت لانتهاء الامتحان"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <FormControlLabel 
                control={
                  <Switch 
                      name="is_final"
                    checked={formData.is_final}
                      onChange={handleInputChange}
                  />
                } 
                label="امتحان نهائي" 
                  sx={{ minWidth: 150 }}
              />
              <FormControlLabel 
                control={
                  <Switch 
                      name="is_active"
                    checked={formData.is_active}
                      onChange={handleInputChange}
                  />
                } 
                label="تفعيل الامتحان" 
                  sx={{ minWidth: 150 }}
              />
              <FormControlLabel 
                control={
                  <Switch 
                      name="allow_multiple_attempts"
                    checked={formData.allow_multiple_attempts}
                      onChange={handleInputChange}
                  />
                } 
                label="السماح بمحاولات متعددة" 
                  sx={{ minWidth: 180 }}
              />
              <FormControlLabel 
                control={
                  <Switch 
                      name="show_answers_after"
                    checked={formData.show_answers_after}
                      onChange={handleInputChange}
                  />
                } 
                label="إظهار الإجابات بعد الانتهاء" 
                  sx={{ minWidth: 200 }}
              />
              <FormControlLabel 
                control={
                  <Switch 
                      name="randomize_questions"
                    checked={formData.randomize_questions}
                      onChange={handleInputChange}
                  />
                } 
                label="ترتيب الأسئلة عشوائياً" 
                  sx={{ minWidth: 180 }}
              />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/teacher/exams')}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} /> : <Save />} 
              sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}
              disabled={saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ExamForm; 