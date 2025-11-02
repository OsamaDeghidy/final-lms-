import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, Chip, Switch, FormControlLabel, Autocomplete } from '@mui/material';
import { Link } from 'react-router-dom';
import { Add as AddIcon, Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { listCirculars, createCircular, deleteCircular, sendCircular } from '../../services/circulars.service';
import { listDivisions } from '../../services/divisions.service';

const CircularsPage = () => {
  const { getUserRole } = useAuth();
  const role = getUserRole();
  const isTeacher = role === 'teacher' || role === 'instructor';

  const [circulars, setCirculars] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', show_on_homepage: true, target_divisions: [] });
  const [loading, setLoading] = useState(false);

  const loadCirculars = async () => {
    setLoading(true);
    try {
      const data = await listCirculars();
      setCirculars(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading circulars', e);
    } finally {
      setLoading(false);
    }
  };

  const loadDivisions = async () => {
    try {
      const data = await listDivisions();
      setDivisions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading divisions', e);
    }
  };

  useEffect(() => {
    loadCirculars();
    if (isTeacher) loadDivisions();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      content: form.content,
      show_on_homepage: !!form.show_on_homepage,
      target_divisions: form.target_divisions.map((d) => d.id),
    };
    try {
      await createCircular(payload);
      setOpenCreate(false);
      setForm({ title: '', content: '', show_on_homepage: true, target_divisions: [] });
      loadCirculars();
    } catch (e) {
      console.error('Error creating circular', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCircular(id);
      loadCirculars();
    } catch (e) {
      console.error('Error deleting circular', e);
    }
  };

  const handleSend = async (id) => {
    try {
      await sendCircular(id);
      loadCirculars();
    } catch (e) {
      console.error('Error sending circular', e);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated = circulars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        التعاميم
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            إدارة التعاميم، إرسال إشعارات ونشرها في الصفحة الرئيسية
          </Typography>
          {isTeacher && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              إنشاء تعميم
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table sx={{ direction: 'rtl' }}>
            <TableHead>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>العنوان</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>النشر في الرئيسية</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>عدد المستلمين</TableCell>
                {isTeacher && <TableCell align="center" sx={{ fontWeight: 'bold' }}>الإجراءات</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell align="right">
                    <Typography fontWeight={600} sx={{ textAlign: 'right' }}>
                      <Link to={`/${isTeacher ? 'teacher' : 'student'}/circulars/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {c.title}
                      </Link>
                    </Typography>
                    {c.content && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }} dangerouslySetInnerHTML={{ __html: c.content }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={c.status === 'sent' ? 'مرسل' : (c.status === 'scheduled' ? 'مجدول' : 'مسودة')} size="small" color={c.status === 'sent' ? 'success' : (c.status === 'scheduled' ? 'warning' : 'default')} />
                  </TableCell>
                  <TableCell align="right">{c.show_on_homepage ? 'نعم' : 'لا'}</TableCell>
                  <TableCell align="right">{c.recipients_count || 0}</TableCell>
                  {isTeacher && (
                    <TableCell align="center">
                      <Tooltip title="إرسال">
                        <IconButton color="primary" onClick={() => handleSend(c.id)} disabled={c.status === 'sent'}>
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton color="error" onClick={() => handleDelete(c.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      {loading ? 'جاري التحميل...' : 'لا توجد تعاميم حالياً'}
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
          count={circulars.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف في الصفحة:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </Paper>

      {/* Dialog: Create Circular */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md" sx={{ direction: 'rtl' }}>
        <DialogTitle>إنشاء تعميم جديد</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="العنوان"
            fullWidth
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ style: { textAlign: 'right' } }}
          />
          <TextField
            label="المحتوى"
            fullWidth
            multiline
            minRows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ style: { textAlign: 'right' } }}
          />
          <FormControlLabel
            control={<Switch checked={form.show_on_homepage} onChange={(e) => setForm({ ...form, show_on_homepage: e.target.checked })} />}
            label="عرض في الصفحة الرئيسية"
            sx={{ mb: 2 }}
          />
          {isTeacher && (
            <Autocomplete
              multiple
              options={divisions}
              getOptionLabel={(option) => option.name}
              value={form.target_divisions}
              onChange={(e, newVal) => setForm({ ...form, target_divisions: newVal })}
              renderInput={(params) => <TextField {...params} label="الشعب المستهدفة" placeholder="اختر الشعب" />}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCreate}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CircularsPage;