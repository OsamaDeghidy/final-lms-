import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { listDivisions, createDivision, deleteDivision } from '../../services/divisions.service';

const DivisionsPage = () => {
  const { getUserRole } = useAuth();
  const role = getUserRole();
  const isTeacher = role === 'teacher' || role === 'instructor';

  const [divisions, setDivisions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const data = await listDivisions();
      setDivisions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading divisions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDivisions();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await createDivision({ name: form.name.trim(), description: form.description });
      setOpenCreate(false);
      setForm({ name: '', description: '' });
      loadDivisions();
    } catch (e) {
      console.error('Error creating division', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDivision(id);
      loadDivisions();
    } catch (e) {
      console.error('Error deleting division', e);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated = divisions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        الشعب
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            إدارة الشعب وتنظيم الطلاب ضمن مجموعات
          </Typography>
          {isTeacher && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              إضافة شعبة
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table sx={{ direction: 'rtl' }}>
            <TableHead>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>اسم الشعبة</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>المنظمة</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>عدد الطلاب</TableCell>
                {isTeacher && <TableCell align="center" sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell align="right">
                    <Typography fontWeight={600} sx={{ textAlign: 'right' }}>{d.name}</Typography>
                    {d.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }} dangerouslySetInnerHTML={{ __html: d.description }} />
                    )}
                  </TableCell>
                  <TableCell align="right">{d.organization_name || '—'}</TableCell>
                  <TableCell align="right">{d.students_count || 0}</TableCell>
                  {isTeacher && (
                    <TableCell align="center">
                      <Tooltip title="حذف">
                        <IconButton color="error" onClick={() => handleDelete(d.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      {loading ? 'جاري التحميل...' : 'لا توجد شعب حالياً'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={divisions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف في الصفحة:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </Paper>

      {/* Dialog: Create Division */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm" sx={{ direction: 'rtl' }}>
        <DialogTitle>إضافة شعبة جديدة</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="اسم الشعبة"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ style: { textAlign: 'right' } }}
          />
          <TextField
            label="الوصف"
            fullWidth
            multiline
            minRows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCreate}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DivisionsPage;