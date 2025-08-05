import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip } from '@mui/material';
import { Add, Edit, Delete, Visibility, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockExams = [
  {
    id: 1,
    title: 'الامتحان النهائي - تطوير الويب',
    course: 'تطوير تطبيقات الويب',
    module: 'مشروع التخرج',
    is_final: true,
    is_active: true,
    created_at: '2024-07-01',
  },
  {
    id: 2,
    title: 'امتحان منتصف الدورة',
    course: 'تطوير تطبيقات الويب',
    module: 'جافاسكريبت الحديثة',
    is_final: false,
    is_active: false,
    created_at: '2024-06-15',
  },
];

const ExamList = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} /> إدارة الامتحانات الشاملة
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
          onClick={() => navigate('/teacher/exams/create')}
        >
          إضافة امتحان جديد
        </Button>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>الدورة</TableCell>
                <TableCell>الوحدة</TableCell>
                <TableCell>نهائي؟</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockExams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell>{exam.module}</TableCell>
                  <TableCell>
                    {exam.is_final ? <Chip label="نهائي" color="success" size="small" /> : <Chip label="عادي" color="info" size="small" />}
                  </TableCell>
                  <TableCell>
                    {exam.is_active ? <Chip label="نشط" color="primary" size="small" /> : <Chip label="معطل" color="default" size="small" />}
                  </TableCell>
                  <TableCell>{exam.created_at}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="عرض التفاصيل"><IconButton onClick={() => navigate(`/teacher/exams/${exam.id}`)}><Visibility color="primary" /></IconButton></Tooltip>
                    <Tooltip title="تعديل"><IconButton onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}><Edit color="warning" /></IconButton></Tooltip>
                    <Tooltip title="حذف"><IconButton><Delete color="error" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ExamList; 