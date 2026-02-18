import { Enrollment } from '../types/course.types';
import { CourseWithEnrollment, EnrolledCourseDetails } from '../types/course.types';
export declare class StudentCourseService {
    static getAllCoursesForStudent(studentId: string): Promise<CourseWithEnrollment[]>;
    static getEnrolledCourses(studentId: string): Promise<EnrolledCourseDetails[]>;
    static getCourseById(courseId: string, studentId: string): Promise<CourseWithEnrollment | null>;
    static enrollInCourse(courseId: string, studentId: string): Promise<Enrollment>;
    static unenrollFromCourse(courseId: string, studentId: string): Promise<void>;
    static updateLastAccessed(courseId: string, studentId: string): Promise<void>;
    static updateProgress(courseId: string, studentId: string, progressPercentage: number): Promise<void>;
}
//# sourceMappingURL=student-course.service.d.ts.map