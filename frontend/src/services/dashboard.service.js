import apiService from './api.service';

class DashboardService {
  // إحصائيات لوحة تحكم الطالب
  async getStudentStats() {
    try {
      const response = await apiService.get('/dashboard/student-stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        enrolledCourses: 0,
        completedLessons: 0,
        pendingAssignments: 0,
        averageGrade: 0,
        totalPoints: 0,
        learningStreak: 0,
        certificates: 0,
        recentActivity: []
      };
    }
  }

  // إحصائيات لوحة تحكم المعلم
  async getTeacherStats() {
    try {
      const response = await apiService.get('/dashboard/teacher-stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
        pendingAssignments: 0,
        upcomingMeetings: 0,
        recentEnrollments: 0,
        courseProgress: []
      };
    }
  }

  // المقررات النشطة للطالب
  async getStudentCourses() {
    try {
      const response = await apiService.get('/dashboard/student-courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student courses:', error);
      return [];
    }
  }

  // المقررات النشطة للمعلم
  async getTeacherCourses() {
    try {
      const response = await apiService.get('/dashboard/teacher-courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  }

  // النشاطات الأخيرة
  async getRecentActivity() {
    try {
      const response = await apiService.get('/dashboard/recent-activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // الواجبات القادمة
  async getUpcomingAssignments() {
    try {
      const response = await apiService.get('/dashboard/upcoming-assignments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      return [];
    }
  }

  // المحاضرات القادمة
  async getUpcomingMeetings() {
    try {
      const response = await apiService.get('/dashboard/upcoming-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      return [];
    }
  }

  // تقدم الطلاب (للمعلم)
  async getStudentProgress() {
    try {
      const response = await apiService.get('/dashboard/student-progress/');
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  }

  // الإنجازات
  async getAchievements() {
    try {
      const response = await apiService.get('/dashboard/achievements/');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // الإعلانات الأخيرة
  async getRecentAnnouncements() {
    try {
      const response = await apiService.get('/dashboard/recent-announcements/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent announcements:', error);
      return [];
    }
  }
}

export default new DashboardService();
