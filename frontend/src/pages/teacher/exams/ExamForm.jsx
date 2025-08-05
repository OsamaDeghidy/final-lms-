import React from 'react';
import { Box, Typography, TextField, Button, Paper, MenuItem, Switch, FormControlLabel, Grid } from '@mui/material';
import { Assessment, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockCourses = [
  { id: 1, title: 'تطوير تطبيقات الويب' },
  { id: 2, title: 'برمجة بايثون' },
];
const mockModules = [
  { id: 1, title: 'مشروع التخرج' },
  { id: 2, title: 'جافاسكريبت الحديثة' },
];

const ExamForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} /> {isEdit ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="عنوان الامتحان" fullWidth required variant="outlined" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="الدورة" fullWidth required variant="outlined" sx={{ mb: 2 }}>
              {mockCourses.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select label="الوحدة (اختياري)" fullWidth variant="outlined" sx={{ mb: 2 }}>
              <MenuItem value="">بدون</MenuItem>
              {mockModules.map((m) => <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="وصف الامتحان" fullWidth multiline minRows={3} variant="outlined" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="الوقت بالدقائق" type="number" fullWidth variant="outlined" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="درجة النجاح (%)" type="number" fullWidth variant="outlined" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel control={<Switch defaultChecked />} label="امتحان نهائي" />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel control={<Switch />} label="تفعيل الامتحان" />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/teacher/exams')}>إلغاء</Button>
          <Button variant="contained" startIcon={<Save />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}>حفظ</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExamForm; 