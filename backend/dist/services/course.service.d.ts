import { Course, CourseModule, CreateCourseData, UpdateCourseData, CreateModuleData, UpdateModuleData } from '../types/course.types';
export declare class CourseService {
    static getCoursesByTeacher(teacherId: string): Promise<Course[]>;
    static getCourseById(courseId: string, teacherId: string): Promise<Course | null>;
    static createCourse(data: CreateCourseData, teacherId: string): Promise<Course>;
    static updateCourse(courseId: string, teacherId: string, data: UpdateCourseData): Promise<Course>;
    static deleteCourse(courseId: string, teacherId: string): Promise<boolean>;
    static getModulesByCourse(courseId: string, teacherId: string): Promise<CourseModule[]>;
    static getModuleById(moduleId: string, teacherId: string): Promise<CourseModule | null>;
    static createModule(data: CreateModuleData, teacherId: string): Promise<CourseModule>;
    static updateModule(moduleId: string, teacherId: string, data: UpdateModuleData): Promise<CourseModule>;
    static deleteModule(moduleId: string, teacherId: string): Promise<boolean>;
    static reorderModules(courseId: string, teacherProfileId: string, modules: {
        id: string;
        order_index: number;
    }[]): Promise<void>;
    static getEnrolledStudents(courseId: string, teacherProfileId: string): Promise<any[]>;
    static getEnrollmentStats(courseId: string, teacherProfileId: string): Promise<any>;
    static getEnrolledStudentById(courseId: string, studentId: string, teacherProfileId: string): Promise<any>;
    static unenrollStudent(courseId: string, studentId: string, teacherProfileId: string): Promise<void>;
}
//# sourceMappingURL=course.service.d.ts.map