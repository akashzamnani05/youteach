export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    message?: string;
};
//# sourceMappingURL=password.utils.d.ts.map