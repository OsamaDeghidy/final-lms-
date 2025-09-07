import api from './api.service';

// Certificate API methods
export const certificateAPI = {
  // Get all certificates (for admin/teacher)
  getCertificates: async (params = {}) => {
    try {
      const response = await api.get('/api/certificates/certificates/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  // Get my certificates (for student)
  getMyCertificates: async () => {
    try {
      const response = await api.get('/api/certificates/my-certificates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my certificates:', error);
      throw error;
    }
  },

  // Get certificate by ID
  getCertificate: async (id) => {
    try {
      const response = await api.get(`/api/certificates/certificates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  },

  // Create new certificate
  createCertificate: async (certificateData) => {
    try {
      const response = await api.post('/api/certificates/certificates/', certificateData);
      return response.data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  },

  // Update certificate
  updateCertificate: async (id, certificateData) => {
    try {
      const response = await api.patch(`/api/certificates/certificates/${id}/`, certificateData);
      return response.data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  },

  // Delete certificate
  deleteCertificate: async (id) => {
    try {
      const response = await api.delete(`/api/certificates/certificates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  },

  // Verify certificate
  verifyCertificate: async (certificateId) => {
    try {
      const response = await api.get(`/api/certificates/verify/${certificateId}/`);
      return response.data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  },

  // Get certificate templates
  getTemplates: async (params = {}) => {
    try {
      const response = await api.get('/api/certificates/templates/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get template by ID
  getTemplate: async (id) => {
    try {
      const response = await api.get(`/api/certificates/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create template
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/api/certificates/templates/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update template
  updateTemplate: async (id, templateData) => {
    try {
      const response = await api.patch(`/api/certificates/templates/${id}/`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete template
  deleteTemplate: async (id) => {
    try {
      const response = await api.delete(`/api/certificates/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Get preset templates
  getPresetTemplates: async () => {
    try {
      const response = await api.get('/api/certificates/preset-templates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching preset templates:', error);
      throw error;
    }
  },

  // Create template from preset
  createFromPreset: async (presetData) => {
    try {
      const response = await api.post('/api/certificates/templates/create-from-preset/', presetData);
      return response.data;
    } catch (error) {
      console.error('Error creating template from preset:', error);
      throw error;
    }
  },

  // Get user signatures
  getSignatures: async () => {
    try {
      const response = await api.get('/api/certificates/signatures/');
      return response.data;
    } catch (error) {
      console.error('Error fetching signatures:', error);
      throw error;
    }
  },

  // Create signature
  createSignature: async (signatureData) => {
    try {
      const response = await api.post('/api/certificates/signatures/', signatureData);
      return response.data;
    } catch (error) {
      console.error('Error creating signature:', error);
      throw error;
    }
  },

  // Get certificate statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/certificates/stats/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
      throw error;
    }
  },

  // Download certificate PDF
  downloadPDF: async (certificateId) => {
    try {
      const response = await api.get(`/api/certificates/certificates/${certificateId}/download/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading certificate PDF:', error);
      throw error;
    }
  },

  // Generate QR code for certificate
  generateQRCode: async (certificateId) => {
    try {
      const response = await api.post(`/api/certificates/certificates/${certificateId}/generate-qr/`);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
};
