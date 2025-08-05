import React, { useState } from 'react';
import { Card, Input, Button, Tag, Typography, message } from 'antd';
import { useParams } from 'react-router-dom';
import { UserOutlined, CheckCircleTwoTone, FileTextOutlined } from '@ant-design/icons';
import './Assignments.css';

const mockSubmission = {
  id: 2,
  student: 'سارة محمد',
  submission_text: 'هذا هو حل الواجب المطلوب ...',
  status: 'submitted',
  grade: null,
  feedback: '',
  is_late: false,
  submitted_at: '2024-07-22T19:00:00',
};

const GradeSubmission = () => {
  const { assignmentId, submissionId } = useParams();
  const [grade, setGrade] = useState(mockSubmission.grade || '');
  const [feedback, setFeedback] = useState(mockSubmission.feedback || '');
  const [loading, setLoading] = useState(false);

  const handleGrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success({
        content: (
          <span style={{ fontSize: 18 }}>
            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginLeft: 8, fontSize: 22 }} />
            تم حفظ التصحيح بنجاح!
          </span>
        ),
        duration: 2.5,
        style: { direction: 'rtl' }
      });
    }, 1000);
  };

  return (
    <div className="assignments-container creative-submit" style={{ maxWidth: 600 }}>
      <Card
        className="creative-card"
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#5e35b1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#7c4dff', fontSize: 24 }} />
            تصحيح تسليم: {mockSubmission.student}
          </span>
        }
        headStyle={{ background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)', borderRadius: '12px 12px 0 0' }}
        bodyStyle={{ background: 'linear-gradient(120deg, #f3e5f5 0%, #fff 100%)', borderRadius: 12 }}
      >
        <p style={{ fontSize: 15, color: '#333', marginBottom: 8 }}><b>وقت التسليم:</b> {new Date(mockSubmission.submitted_at).toLocaleString('ar-EG')}</p>
        <Tag color={mockSubmission.is_late ? 'red' : 'blue'} style={{ fontSize: 15, borderRadius: 8 }}>
          {mockSubmission.is_late ? 'متأخر' : 'مُرسل'}
        </Tag>
        <Typography.Paragraph style={{ marginTop: 16, fontSize: 16, color: '#5e35b1', fontWeight: 600 }}>
          <FileTextOutlined style={{ color: '#7c4dff', marginLeft: 6 }} /> نص التسليم:
        </Typography.Paragraph>
        <Typography.Paragraph style={{ margin: '0 0 18px 0', fontSize: 16, color: '#333', background: '#f8fafc', borderRadius: 8, padding: 12, boxShadow: '0 1px 8px 0 rgba(126,87,194,0.07)' }}>
          {mockSubmission.submission_text}
        </Typography.Paragraph>
        <Input
          type="number"
          placeholder="الدرجة"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{ marginBottom: 12, width: 120, borderRadius: 8, border: '1.5px solid #b39ddb', background: '#f3e5f5' }}
        />
        <Input.TextArea
          placeholder="ملاحظات للطالب"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={3}
          style={{ marginBottom: 12, borderRadius: 8, border: '1.5px solid #b39ddb', background: '#f3e5f5' }}
        />
        <Button type="primary" loading={loading} onClick={handleGrade} className="creative-submit-btn">
          <CheckCircleTwoTone twoToneColor="#fff" style={{ marginLeft: 6, fontSize: 20 }} />
          حفظ التصحيح
        </Button>
      </Card>
    </div>
  );
};

export default GradeSubmission; 