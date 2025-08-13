import React, { useEffect, useState } from 'react';
import { Box, Card, TextField, Button, Typography, MenuItem, Switch, FormControlLabel, InputAdornment, Alert, Grid, IconButton, FormControl, InputLabel, Select, Paper, Stepper, Step, StepLabel, StepContent, Checkbox, Radio } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/Quiz';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DescriptionIcon from '@mui/icons-material/Description';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import assignmentsAPI from '../../services/assignment.service';
import { courseAPI } from '../../services/api.service';
import contentAPI from '../../services/content.service';


const EditAssignment = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    module: '',
    due_date: '',
    duration: 60,
    points: 100,
    allow_late_submissions: false,
    late_submission_penalty: 0,
    has_questions: false,
    has_file_upload: false,
    assignment_file: null,
    max_attempts: 1,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getCourses();
        const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : data?.courses || []);
        const normalized = arr.map((c) => ({ id: c.id, title: c.title }));
        setCourses(normalized);
      } catch {
        setCourses([]);
      }
    };
    fetchCourses();

    const fetchAssignment = async () => {
      try {
        const data = await assignmentsAPI.getAssignmentById(assignmentId);
        setForm({
          title: data.title || '',
          description: data.description || '',
          course: data.course || '',
          module: data.module || '',
          due_date: data.due_date ? dayjs(data.due_date).format('YYYY-MM-DDTHH:mm') : '',
          duration: data.duration || 60,
          points: data.points || 100,
          allow_late_submissions: !!data.allow_late_submissions,
          late_submission_penalty: data.late_submission_penalty || 0,
          has_questions: !!data.has_questions,
          has_file_upload: !!data.has_file_upload,
          assignment_file: null,
          max_attempts: data.max_attempts || 1,
          is_active: data.is_active !== false,
        });
        // Always load questions via API (combined endpoint → fallback per-question)
        try {
          const qa = await assignmentsAPI.getAssignmentQuestionsWithAnswers(assignmentId);
          const list = Array.isArray(qa?.results) ? qa.results : (Array.isArray(qa) ? qa : qa?.questions || qa || []);
          const normalized = list.map((q, qi) => ({
            id: q.id,
            text: q.text || '',
            question_type: q.question_type || 'essay',
            points: q.points ?? 0,
            explanation: q.explanation || '',
            order: q.order ?? qi,
            is_required: q.is_required !== false,
            answers: Array.isArray(q.answers) ? q.answers.map((a, ai) => ({
              id: a.id,
              text: a.text || '',
              is_correct: !!a.is_correct,
              explanation: a.explanation || '',
              order: a.order ?? ai,
            })) : [],
          }));
          setQuestions(normalized);
        } catch {
          const qData = await assignmentsAPI.getAssignmentQuestions(assignmentId);
          const list = Array.isArray(qData?.results) ? qData.results : (Array.isArray(qData) ? qData : qData?.questions || qData || []);
          const withAnswers = [];
          for (const q of list) {
            try {
              const aData = await assignmentsAPI.getQuestionAnswers(q.id);
              const answers = Array.isArray(aData?.results) ? aData.results : (Array.isArray(aData) ? aData : aData?.answers || []);
              withAnswers.push({ ...q, answers });
            } catch {
              withAnswers.push({ ...q, answers: [] });
            }
          }
          setQuestions(withAnswers);
        }
      } catch (e) {
        setError('تعذر تحميل بيانات الواجب');
      }
    };
    if (assignmentId) fetchAssignment();
  }, [assignmentId]);

  // Load modules when course changes
  useEffect(() => {
    const loadModules = async () => {
      if (!form.course) { setModules([]); return; }
      setLoadingModules(true);
      try {
        const data = await contentAPI.getModules(form.course);
        const items = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : data?.modules || []);
        const normalized = items.map((m) => ({ id: m.id, title: m.name || m.title || `وحدة ${m.id}` }));
        setModules(normalized);
      } catch {
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };
    loadModules();
  }, [form.course]);

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await assignmentsAPI.updateAssignment(assignmentId, {
        title: form.title,
        description: form.description,
        course: form.course,
        module: form.module || null,
        due_date: form.due_date,
        points: form.points,
        duration: form.duration,
        max_attempts: form.max_attempts,
        allow_late_submissions: form.allow_late_submissions,
        late_submission_penalty: form.late_submission_penalty,
        has_questions: form.has_questions,
        has_file_upload: form.has_file_upload,
        assignment_file: form.assignment_file,
        is_active: form.is_active,
      });
      // Persist questions and answers (basic sync: create new, update existing by id, ignore deletions for now)
      for (const q of questions) {
        if (String(q.id || '').startsWith('tmp-')) {
          const createdQ = await assignmentsAPI.createQuestion({
            assignment: assignmentId,
            text: q.text,
            question_type: q.question_type || 'essay',
            points: q.points || 0,
            explanation: q.explanation || '',
            order: q.order || 0,
            is_required: q.is_required !== false,
          });
          if (createdQ?.id && Array.isArray(q.answers)) {
            for (const a of q.answers) {
              await assignmentsAPI.createAnswer({
                question: createdQ.id,
                text: a.text || '',
                is_correct: !!a.is_correct,
                explanation: a.explanation || '',
                order: a.order || 0,
              });
            }
          }
        } else {
          await assignmentsAPI.updateQuestion(q.id, {
            text: q.text,
            question_type: q.question_type,
            points: q.points,
            explanation: q.explanation,
            order: q.order,
            is_required: q.is_required,
          });
          if (Array.isArray(q.answers)) {
            for (const a of q.answers) {
              if (a.id) {
                await assignmentsAPI.updateAnswer(a.id, {
                  text: a.text,
                  is_correct: a.is_correct,
                  explanation: a.explanation,
                  order: a.order,
                });
              } else {
                await assignmentsAPI.createAnswer({
                  question: q.id,
                  text: a.text,
                  is_correct: a.is_correct,
                  explanation: a.explanation,
                  order: a.order,
                });
              }
            }
          }
        }
      }
      navigate('/teacher/assignments');
    } catch (e) {
      setError('تعذر حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => ([
      ...prev,
      { id: `tmp-${Date.now()}`, text: '', question_type: 'essay', points: 0, explanation: '', order: prev.length + 1, is_required: true, answers: [] }
    ]));
  };

  const updateQuestion = (qid, field, value) => {
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (qid) => {
    setQuestions(prev => prev.filter(q => q.id !== qid));
  };

  const addAnswer = (qid) => {
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, answers: [...(q.answers || []), { text: '', is_correct: false, explanation: '', order: (q.answers?.length || 0) }] } : q));
  };

  const updateAnswer = (qid, idx, field, value) => {
    setQuestions(prev => prev.map(q => q.id === qid ? {
      ...q,
      answers: (q.answers || []).map((a, i) => i === idx ? { ...a, [field]: value } : a)
    } : q));
  };

  const removeAnswer = (qid, idx) => {
    setQuestions(prev => prev.map(q => q.id === qid ? {
      ...q,
      answers: (q.answers || []).filter((_, i) => i !== idx)
    } : q));
  };

  return (
    <Box className="assignments-container">
      {/* Header (match Create) */}
      <Box sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', borderRadius: 3, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>تعديل الواجب</Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>تعديل بيانات الواجب والأسئلة</Typography>
        </Box>
      </Box>

      {/* Stepper (match Create) */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>معلومات الواجب الأساسية</Typography>
              <Typography variant="body2" color="text.secondary">عنوان الواجب والوصف والمقرر</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField fullWidth label="عنوان الواجب" variant="outlined" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <TextField fullWidth label="وصف الواجب" variant="outlined" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                <FormControl fullWidth>
                  <InputLabel>المقرر</InputLabel>
                  <Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} label="المقرر">
                    {courses.map((c) => (<MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>))}
                  </Select>
                </FormControl>
                {!!form.course && (
                  <FormControl fullWidth>
                    <InputLabel>الوحدة</InputLabel>
                    <Select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} label="الوحدة">
                      <MenuItem value="">—</MenuItem>
                      {modules.map((m) => (<MenuItem key={m.id} value={m.id} disabled={loadingModules}>{m.title}</MenuItem>))}
                    </Select>
                  </FormControl>
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>التالي</Button>
                <Button disabled onClick={handleBack} sx={{ mr: 1 }}>السابق</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>إعدادات الواجب</Typography>
              <Typography variant="body2" color="text.secondary">التواريخ والدرجات والإعدادات</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="تاريخ ووقت التسليم" type="datetime-local" variant="outlined" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} InputLabelProps={{ shrink: true }} required />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="المدة (بالدقائق)" type="number" variant="outlined" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} inputProps={{ min: 1 }} />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="الدرجة الكلية" type="number" variant="outlined" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} inputProps={{ min: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="الحد الأقصى للمحاولات" type="number" variant="outlined" value={form.max_attempts} onChange={(e) => setForm({ ...form, max_attempts: Number(e.target.value) })} inputProps={{ min: 1 }} />
                  </Grid>
                </Grid>
                <FormControlLabel control={<Switch checked={form.allow_late_submissions} onChange={(e) => setForm({ ...form, allow_late_submissions: e.target.checked })} />} label="السماح بالتسليم المتأخر" />
                {form.allow_late_submissions && (
                  <TextField fullWidth label="خصم التسليم المتأخر (%)" type="number" variant="outlined" value={form.late_submission_penalty} onChange={(e) => setForm({ ...form, late_submission_penalty: Number(e.target.value) })} inputProps={{ min: 0, max: 100 }} />
                )}
                <FormControlLabel control={<Switch checked={form.has_questions} onChange={(e) => setForm({ ...form, has_questions: e.target.checked })} />} label="يحتوي على أسئلة" />
                <FormControlLabel control={<Switch checked={form.has_file_upload} onChange={(e) => setForm({ ...form, has_file_upload: e.target.checked })} />} label="يسمح برفع ملفات" />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>التالي</Button>
                <Button onClick={handleBack} sx={{ mr: 1 }}>السابق</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>إضافة الأسئلة</Typography>
              <Typography variant="body2" color="text.secondary">إنشاء أسئلة الواجب</Typography>
            </StepLabel>
            <StepContent>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>أسئلة الواجب</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={addQuestion} sx={{ background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)', '&:hover': { background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)' } }}>إضافة سؤال</Button>
                </Box>
                {questions.length === 0 ? (
                  <Alert severity="info">لا توجد أسئلة بعد. اضغط على "إضافة سؤال" لبدء إنشاء الأسئلة.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {questions.map((q, qi) => (
                      <Grid item xs={12} key={q.id}>
                        <Card sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1">سؤال {qi + 1}</Typography>
                            <IconButton color="error" onClick={() => removeQuestion(q.id)}><DeleteIcon /></IconButton>
          </Box>
                          <TextField fullWidth label="نص السؤال" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>نوع السؤال</InputLabel>
                                <Select value={q.question_type} label="نوع السؤال" onChange={(e) => updateQuestion(q.id, 'question_type', e.target.value)}>
                                  <MenuItem value="multiple_choice">اختيار من متعدد</MenuItem>
                                  <MenuItem value="true_false">صح أو خطأ</MenuItem>
                                  <MenuItem value="short_answer">إجابة قصيرة</MenuItem>
                                  <MenuItem value="essay">مقال</MenuItem>
                                  <MenuItem value="file_upload">رفع ملف</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <TextField label="الدرجة" type="number" fullWidth value={q.points || 0} onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <TextField label="الترتيب" type="number" fullWidth value={q.order || 0} onChange={(e) => updateQuestion(q.id, 'order', Number(e.target.value))} />
                            </Grid>
                          </Grid>
                          {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>الإجابات</Typography>
                              {(q.answers || []).map((a, ai) => (
                                <Grid container spacing={1} alignItems="center" key={ai} sx={{ mb: 1 }}>
                                  <Grid item xs={12} md={6}>
                                    <TextField fullWidth label={`الإجابة ${ai + 1}`} value={a.text} onChange={(e) => updateAnswer(q.id, ai, 'text', e.target.value)} />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <FormControlLabel control={<Switch checked={!!a.is_correct} onChange={(e) => updateAnswer(q.id, ai, 'is_correct', e.target.checked)} />} label="صحيحة" />
                                  </Grid>
                                  <Grid item xs={12} md={2}>
                                    <TextField fullWidth label="ترتيب" type="number" value={a.order || 0} onChange={(e) => updateAnswer(q.id, ai, 'order', Number(e.target.value))} />
                                  </Grid>
                                  <Grid item xs={12} md={1}>
                                    <IconButton color="error" onClick={() => removeAnswer(q.id, ai)}><DeleteIcon /></IconButton>
                                  </Grid>
                                </Grid>
                              ))}
                              <Button size="small" variant="outlined" onClick={() => addAnswer(q.id)} startIcon={<AddIcon />}>إضافة إجابة</Button>
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>التالي</Button>
                <Button onClick={handleBack} sx={{ mr: 1 }}>السابق</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>مراجعة وإرسال</Typography>
              <Typography variant="body2" color="text.secondary">مراجعة الواجب وحفظه</Typography>
            </StepLabel>
            <StepContent>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>{form.title || 'عنوان الواجب'}</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>{form.description || 'وصف الواجب'}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">المقرر: {form.course || 'غير محدد'}</Typography>
                    <Typography variant="body2" color="text.secondary">الوحدة: {form.module || 'غير محدد'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">تاريخ التسليم: {form.due_date || 'غير محدد'}</Typography>
                    <Typography variant="body2" color="text.secondary">الدرجة: {form.points} نقطة</Typography>
                  </Grid>
                </Grid>
        </Card>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mr: 1 }}>حفظ التعديلات</Button>
                <Button onClick={handleBack} sx={{ mr: 1 }}>السابق</Button>
      </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Box>
  );
};

export default EditAssignment; 