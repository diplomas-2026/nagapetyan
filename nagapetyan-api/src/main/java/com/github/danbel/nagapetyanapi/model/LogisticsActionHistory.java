package com.github.danbel.nagapetyanapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "logistics_action_history")
public class LogisticsActionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
    @Column(name = "actor_login", nullable = false)
    private String actorLogin;
    @Column(name = "actor_full_name", nullable = false)
    private String actorFullName;
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private LogisticsActionType actionType;
    @Column(name = "record_id", nullable = false)
    private Long recordId;
    @Column(name = "record_shipment_number", nullable = false)
    private String recordShipmentNumber;
    @Column(name = "summary", nullable = false, columnDefinition = "text")
    private String summary;
    @Column(name = "before_state", columnDefinition = "text")
    private String beforeState;
    @Column(name = "after_state", columnDefinition = "text")
    private String afterState;
    @Column(name = "reverted", nullable = false)
    private boolean reverted;
    @Column(name = "reverted_at")
    private Instant revertedAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getActorLogin() {
        return actorLogin;
    }

    public void setActorLogin(String actorLogin) {
        this.actorLogin = actorLogin;
    }

    public String getActorFullName() {
        return actorFullName;
    }

    public void setActorFullName(String actorFullName) {
        this.actorFullName = actorFullName;
    }

    public LogisticsActionType getActionType() {
        return actionType;
    }

    public void setActionType(LogisticsActionType actionType) {
        this.actionType = actionType;
    }

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getRecordShipmentNumber() {
        return recordShipmentNumber;
    }

    public void setRecordShipmentNumber(String recordShipmentNumber) {
        this.recordShipmentNumber = recordShipmentNumber;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getBeforeState() {
        return beforeState;
    }

    public void setBeforeState(String beforeState) {
        this.beforeState = beforeState;
    }

    public String getAfterState() {
        return afterState;
    }

    public void setAfterState(String afterState) {
        this.afterState = afterState;
    }

    public boolean isReverted() {
        return reverted;
    }

    public void setReverted(boolean reverted) {
        this.reverted = reverted;
    }

    public Instant getRevertedAt() {
        return revertedAt;
    }

    public void setRevertedAt(Instant revertedAt) {
        this.revertedAt = revertedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
