package com.hackstreak.learning_platform.dto;

public class SignUpRequestDto {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private String studentId;
    private String academicYear;
    private String department;

    public SignUpRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
