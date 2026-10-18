package org.acme.models;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.acme.enums.Priority;

import java.time.Instant;

@Entity
@Table(name = "cases")
public class Case extends PanacheEntity {

    @ManyToOne
    private User createdBy;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdAt;

    @NotNull
    private Boolean isSos;

    @NotNull
    private String description;

    @NotNull
    private String patientName;

    @NotNull
    private Integer birthYear;

    @NotNull
    private String sex;

    private Integer bpm;

    private Integer systolicPressure;

    private Integer diastolicPressure;

    private Integer resRate;

    private Integer saturation;

    private Double temperature;

    private Boolean acknowledged = false;

    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private Double latitude;

    private Double longitude;

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Boolean getIsSos() { return isSos; }
    public void setIsSos(Boolean isSos) { this.isSos = isSos; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getBirthYear() { return birthYear; }
    public void setBirthYear(Integer birthYear) { this.birthYear = birthYear; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public Integer getBpm() { return bpm; }
    public void setBpm(Integer bpm) { this.bpm = bpm; }

    public Integer getSystolicPressure() { return systolicPressure; }
    public void setSystolicPressure(Integer systolicPressure) { this.systolicPressure = systolicPressure; }

    public Integer getDiastolicPressure() { return diastolicPressure; }
    public void setDiastolicPressure(Integer diastolicPressure) { this.diastolicPressure = diastolicPressure; }

    public Integer getResRate() { return resRate; }
    public void setResRate(Integer resRate) { this.resRate = resRate; }

    public Integer getSaturation() { return saturation; }
    public void setSaturation(Integer saturation) { this.saturation = saturation; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) {  this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}