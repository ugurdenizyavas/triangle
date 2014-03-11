package com.deniz.balanced.mission.persistence.entity;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.deniz.balanced.mission.persistence.enums.TaskLevelEnum;
import com.deniz.framework.persistence.entity.AbstractEntity;

@Entity
@Table(name = "MISSION_ENTITY", uniqueConstraints = { @UniqueConstraint(columnNames = { "simpleName" }) })
@SequenceGenerator(name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "MISSION_SEQUENCE")
public class MissionEntity extends AbstractEntity {
	private Date validFrom;
	private Date validTo;
	private String description;
	private TaskLevelEnum expertise;

	public Date getValidFrom() {
		return this.validFrom;
	}

	public Date getValidTo() {
		return this.validTo;
	}

	public String getDescription() {
		return this.description;
	}

	public TaskLevelEnum getExpertise() {
		return this.expertise;
	}

	public void setExpertise(TaskLevelEnum expertise) {
		this.expertise = expertise;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public void setValidFrom(Date validFrom) {
		this.validFrom = validFrom;
	}

	public void setValidTo(Date validTo) {
		this.validTo = validTo;
	}

}
