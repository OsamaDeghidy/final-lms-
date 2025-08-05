import React, { useState } from 'react';
import { Box, Card, TextField, Button, Typography, MenuItem, Switch, FormControlLabel, InputAdornment } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import AssignmentIcon from '@mui/icons-material/Assignment';

const mockCourses = [
  { id: 1, title: 'تطوير تطبيقات الويب المتقدمة' },
  { id: 2, title: 'تعلم لغة JavaScript' },
];
const mockModules = [
  { id: 1, title: 'الوحدة الأولى' },
  { id: 2, title: 'الوحدة الثانية' },
];
const mockAssignment = {
  title: 'واجب الرياضيات',
  description: 'حل مسائل من 1 إلى 10 في الكتاب.',
  course: 1,
  module: 2,
  dueDate: dayjs().add(5, 'day'),
  points: 100,
  allowLate: true,
  latePenalty: 10,
};

const EditAssignment = () => {
  const [form, setForm] = useState({ ...mockAssignment });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'linear-gradient(120deg, #ede7f6 0%, #fff 100%)', py: 8 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Card sx={{ p: 5, borderRadius: 8, boxShadow: '0 8px 32px 0 rgba(124,77,255,0.13)', background: 'rgba(255,255,255,0.97)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <AssignmentIcon sx={{ fontSize: 48, color: '#7c4dff', mb: 1 }} />
            <Typography variant="h4" fontWeight={900} color="#5e35b1" mb={1}>
              تعديل الواجب
            </Typography>
          </Box>
          <TextField
            label="عنوان الواجب"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="وصف الواجب"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="الكورس"
            name="course"
            value={form.course}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          >
            {mockCourses.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="الوحدة (اختياري)"
            name="module"
            value={form.module}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">—</MenuItem>
            {mockModules.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>
            ))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="تاريخ التسليم"
              value={form.dueDate}
              onChange={val => setForm({ ...form, dueDate: val })}
              sx={{ mb: 2, width: '100%' }}
            />
          </LocalizationProvider>
          <TextField
            label="الدرجة الكاملة"
            name="points"
            type="number"
            value={form.points}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ endAdornment: <InputAdornment position="end">نقطة</InputAdornment> }}
          />
          <FormControlLabel
            control={<Switch checked={form.allowLate} onChange={e => setForm({ ...form, allowLate: e.target.checked })} />}
            label="السماح بالتسليم المتأخر"
            sx={{ mb: 2 }}
          />
          {form.allowLate && (
            <TextField
              label="عقوبة التأخير (%)"
              name="latePenalty"
              type="number"
              value={form.latePenalty}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<AssignmentIcon />}
            sx={{ mt: 3, fontWeight: 700, fontSize: 20, borderRadius: 3, backgroundColor: '#7c4dff', py: 1.5, boxShadow: '0 2px 12px 0 rgba(124,77,255,0.10)' }}
            disabled={saving}
          >
            حفظ التعديلات
          </Button>
        </Card>
      </Box>
    </Box>
  );
};

export default EditAssignment; 