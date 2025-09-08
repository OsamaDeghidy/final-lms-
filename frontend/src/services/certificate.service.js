import api from './api.service';

const certificateAPI = {
  // Generate certificate for completed course
  generateCertificate: async (courseId) => {
    try {
      const response = await api.post(`/api/certificates/generate/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },

  // Get user's certificates
  getMyCertificates: async () => {
    try {
      const response = await api.get('/api/certificates/get-my-certificates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  // Get certificate details
  getCertificateDetail: async (certificateId) => {
    try {
      const response = await api.get(`/api/certificates/detail/${certificateId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate detail:', error);
      throw error;
    }
  },

  // Verify certificate by verification code
  verifyCertificate: async (verificationCode) => {
    try {
      const response = await api.get(`/api/certificates/verify-code/${verificationCode}/`);
      return response.data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  },

  // Download certificate PDF
  downloadPDF: async (certificateId) => {
    try {
      const response = await api.get(`/api/certificates/download/${certificateId}/`);
      return response.data; // Return the full response object
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  },

  // Check course completion status
  checkCourseCompletion: async (courseId) => {
    try {
      const response = await api.get(`/api/certificates/check-completion/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error checking course completion:', error);
      throw error;
    }
  },

  // Get certificate verification URL
  getVerificationUrl: (verificationCode) => {
    return `${window.location.origin}/certificates/verify/${verificationCode}`;
  },

  // Share certificate
  shareCertificate: async (certificate) => {
    const verificationUrl = certificateAPI.getVerificationUrl(certificate.verification_code);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `شهادة ${certificate.course_name}`,
          text: `شهادة إكمال دورة ${certificate.course_name}`,
          url: verificationUrl
        });
        return { success: true, message: 'تم مشاركة الشهادة بنجاح' };
      } catch (error) {
        if (error.name !== 'AbortError') {
          throw error;
        }
        return { success: false, message: 'تم إلغاء المشاركة' };
      }
    } else {
      try {
        await navigator.clipboard.writeText(verificationUrl);
        return { success: true, message: 'تم نسخ رابط التحقق من الشهادة' };
      } catch (error) {
        throw new Error('فشل في نسخ رابط الشهادة');
      }
    }
  }
};

export default certificateAPI;