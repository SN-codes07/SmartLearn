package com.hackstreak.learning_platform.dto;

import java.util.List;

public class RecoveryPlanDto {
    private Long weakConceptId;
    private String weakConceptName;
    private String subjectName;
    private String chapterName;
    private Double currentMastery;
    private String status; // "WEAK"
    private String severity; // "CRITICAL" (<50%) or "MODERATE" (50-74%)
    private String rootCauseSummary;
    private List<PrerequisiteDiagnosisItemDto> prerequisiteDiagnosis;
    private List<RecoveryStepDto> recoverySteps;
    private boolean readyForReassessment;
    private boolean isRecovered; // true if reached >= 75%

    public Long getWeakConceptId() { return weakConceptId; }
    public void setWeakConceptId(Long weakConceptId) { this.weakConceptId = weakConceptId; }

    public String getWeakConceptName() { return weakConceptName; }
    public void setWeakConceptName(String weakConceptName) { this.weakConceptName = weakConceptName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getChapterName() { return chapterName; }
    public void setChapterName(String chapterName) { this.chapterName = chapterName; }

    public Double getCurrentMastery() { return currentMastery; }
    public void setCurrentMastery(Double currentMastery) { this.currentMastery = currentMastery; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getRootCauseSummary() { return rootCauseSummary; }
    public void setRootCauseSummary(String rootCauseSummary) { this.rootCauseSummary = rootCauseSummary; }

    public List<PrerequisiteDiagnosisItemDto> getPrerequisiteDiagnosis() { return prerequisiteDiagnosis; }
    public void setPrerequisiteDiagnosis(List<PrerequisiteDiagnosisItemDto> prerequisiteDiagnosis) { this.prerequisiteDiagnosis = prerequisiteDiagnosis; }

    public List<RecoveryStepDto> getRecoverySteps() { return recoverySteps; }
    public void setRecoverySteps(List<RecoveryStepDto> recoverySteps) { this.recoverySteps = recoverySteps; }

    public boolean isReadyForReassessment() { return readyForReassessment; }
    public void setReadyForReassessment(boolean readyForReassessment) { this.readyForReassessment = readyForReassessment; }

    public boolean isRecovered() { return isRecovered; }
    public void setRecovered(boolean recovered) { isRecovered = recovered; }
}
