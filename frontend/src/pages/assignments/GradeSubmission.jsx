import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Tag, Typography, message, Spin, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UserOutlined, CheckCircleTwoTone, FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import assignmentsAPI from '../../services/assignment.service';
import './Assignments.css';

const GradeSubmission = () => {
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  // Fetch submission and assignment data
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      setError(null);
      try {
        // Fetch submission details
        const submissionData = await assignmentsAPI.getSubmissionById(submissionId);
        setSubmission(submissionData);
        
        // Set initial values
        setGrade(submissionData.grade || '');
        setFeedback(submissionData.feedback || '');
        
        // Fetch assignment details
        const assignmentData = await assignmentsAPI.getAssignmentById(assignmentId);
        setAssignment(assignmentData);
      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('تعذر تحميل بيانات التسليم. يرجى المحاولة مرة أخرى.');
      } finally {
        setFetching(false);
      }
    };

    if (submissionId && assignmentId) {
      fetchData();
    }
  }, [submissionId, assignmentId]);

  const handleGrade = async () => {
    if (!grade || grade < 0 || grade > (assignment?.points || 100)) {
      message.error('يرجى إدخال درجة صحيحة');
      return;
    }

    setLoading(true);
    try {
      const gradePayload = {
        grade: Number(grade),
        feedback: feedback,
        status: 'graded'
      };

      await assignmentsAPI.gradeSubmission(submissionId, gradePayload);
      
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

      // Navigate back to submissions list
      setTimeout(() => {
        navigate(`/teacher/assignments/${assignmentId}/submissions`);
      }, 1500);
    } catch (error) {
      console.error('Error saving grade:', error);
      message.error('حدث خطأ أثناء حفظ التصحيح. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (fetching) {
    return (
      <div className="assignments-container creative-submit" style={{ maxWidth: 600, textAlign: 'center' }}>
        <Spin size="large" />
        <Typography.Text style={{ display: 'block', marginTop: 16 }}>
          جاري تحميل بيانات التسليم...
        </Typography.Text>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="assignments-container creative-submit" style={{ maxWidth: 600 }}>
        <Alert
          message="خطأ"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
        >
          العودة للتسليمات
        </Button>
      </div>
    );
  }

  // Show message if no submission found
  if (!submission) {
    return (
      <div className="assignments-container creative-submit" style={{ maxWidth: 600 }}>
        <Alert
          message="تنبيه"
          description="لم يتم العثور على التسليم المطلوب"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
        >
          العودة للتسليمات
        </Button>
      </div>
    );
  }

  return (
    <div className="assignments-container creative-submit" style={{ maxWidth: 600 }}>
      <Card
        className="creative-card"
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#5e35b1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#7c4dff', fontSize: 24 }} />
            تصحيح تسليم: {submission.student_name || 'طالب'}
          </span>
        }
        headStyle={{ background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)', borderRadius: '12px 12px 0 0' }}
        bodyStyle={{ background: 'linear-gradient(120deg, #f3e5f5 0%, #fff 100%)', borderRadius: 12 }}
        extra={
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
            size="small"
          >
            العودة
          </Button>
        }
      >
        <p style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
          <b>وقت التسليم:</b> {new Date(submission.submitted_at).toLocaleString('ar-EG')}
        </p>
        <Tag color={submission.is_late ? 'red' : 'blue'} style={{ fontSize: 15, borderRadius: 8 }}>
          {submission.is_late ? 'متأخر' : 'مُرسل'}
        </Tag>
        
        {assignment && (
          <p style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
            <b>الواجب:</b> {assignment.title}
          </p>
        )}
        
        {submission.submission_text && (
          <>
            <Typography.Paragraph style={{ marginTop: 16, fontSize: 16, color: '#5e35b1', fontWeight: 600 }}>
              <FileTextOutlined style={{ color: '#7c4dff', marginLeft: 6 }} /> نص التسليم:
            </Typography.Paragraph>
            <Typography.Paragraph style={{ margin: '0 0 18px 0', fontSize: 16, color: '#333', background: '#f8fafc', borderRadius: 8, padding: 12, boxShadow: '0 1px 8px 0 rgba(126,87,194,0.07)' }}>
              {submission.submission_text}
            </Typography.Paragraph>
          </>
        )}
        
        {submission.submitted_file && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              الملف المرفوع:
            </Typography.Text>
            <Button 
              type="link" 
              icon={<FileTextOutlined />}
              onClick={() => window.open(submission.submitted_file, '_blank')}
            >
              عرض الملف
            </Button>
          </div>
        )}
        
        {/* عرض إجابات الطالب على الأسئلة */}
        {submission.question_responses && submission.question_responses.length > 0 && (
          <>
            <Typography.Paragraph style={{ marginTop: 16, fontSize: 16, color: '#5e35b1', fontWeight: 600 }}>
              <FileTextOutlined style={{ color: '#7c4dff', marginLeft: 6 }} /> إجابات الطالب على الأسئلة:
            </Typography.Paragraph>
            {submission.question_responses.map((response, index) => {
              // Debug: log response data
              console.log(`Response ${index}:`, response);
              
              return (
                <div key={response.id || index} style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8, color: '#5e35b1' }}>
                    السؤال {index + 1}: {response.question_text || 'سؤال'}
                  </Typography.Text>
                  
                  {/* عرض الإجابة النصية */}
                  {response.text_answer && (
                    <Typography.Paragraph style={{ margin: '8px 0', fontSize: 14, color: '#333' }}>
                      <strong>الإجابة النصية:</strong> {response.text_answer}
                    </Typography.Paragraph>
                  )}
                  
                  {/* عرض الإجابة المختارة */}
                  {response.selected_answer && (
                    <Typography.Paragraph style={{ margin: '8px 0', fontSize: 14, color: '#333' }}>
                      <strong>الإجابة المختارة:</strong> 
                      {response.selected_answer_text || 
                       (response.selected_answer && typeof response.selected_answer === 'object' ? response.selected_answer.text : response.selected_answer) ||
                       'إجابة مختارة'}
                    </Typography.Paragraph>
                  )}
                  
                  {/* عرض الإجابة المختارة كـ object إذا كانت موجودة */}
                  {response.selected_answer && typeof response.selected_answer === 'object' && (
                    <Typography.Paragraph style={{ margin: '8px 0', fontSize: 14, color: '#666', fontStyle: 'italic' }}>
                      <strong>تفاصيل الإجابة المختارة:</strong> ID: {response.selected_answer.id}, النص: {response.selected_answer.text}
                    </Typography.Paragraph>
                  )}
                  
                  {/* عرض الإجابة المختارة كـ ID إذا كانت موجودة */}
                  {response.selected_answer && typeof response.selected_answer === 'number' && (
                    <Typography.Paragraph style={{ margin: '8px 0', fontSize: 14, color: '#666', fontStyle: 'italic' }}>
                      <strong>معرف الإجابة المختارة:</strong> {response.selected_answer}
                    </Typography.Paragraph>
                  )}
                  
                  {/* عرض الملف المرفوع */}
                  {response.file_answer && (
                    <div style={{ margin: '8px 0' }}>
                      <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                        الملف المرفوع:
                      </Typography.Text>
                      <Button 
                        type="link" 
                        icon={<FileTextOutlined />}
                        onClick={() => window.open(response.file_answer, '_blank')}
                        size="small"
                      >
                        عرض الملف
                      </Button>
                    </div>
                  )}
                  
                  {/* عرض الدرجة المكتسبة */}
                  {response.points_earned !== undefined && (
                    <Typography.Text style={{ display: 'block', marginTop: 8, color: '#52c41a', fontWeight: 600 }}>
                      الدرجة المكتسبة: {response.points_earned}
                    </Typography.Text>
                  )}
                  
                  {/* Debug info */}
                  <div style={{ marginTop: 8, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: 12, color: '#666' }}>
                    <strong>Debug Info:</strong><br/>
                    selected_answer: {JSON.stringify(response.selected_answer)}<br/>
                    selected_answer_text: {response.selected_answer_text}<br/>
                    text_answer: {response.text_answer}<br/>
                    file_answer: {response.file_answer}
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        <Input
          type="number"
          placeholder="الدرجة"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{ marginBottom: 12, width: 120, borderRadius: 8, border: '1.5px solid #b39ddb', background: '#f3e5f5' }}
          min={0}
          max={assignment?.points || 100}
        />
        <Input.TextArea
          placeholder="ملاحظات للطالب"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={3}
          style={{ marginBottom: 12, borderRadius: 8, border: '1.5px solid #b39ddb', background: '#f3e5f5' }}
        />
        <Button 
          type="primary" 
          loading={loading} 
          onClick={handleGrade} 
          className="creative-submit-btn"
          disabled={!grade || grade < 0 || grade > (assignment?.points || 100)}
        >
          <CheckCircleTwoTone twoToneColor="#fff" style={{ marginLeft: 6, fontSize: 20 }} />
          حفظ التصحيح
        </Button>
      </Card>
    </div>
  );
};

export default GradeSubmission; 