package com.deniz.balanced.mission.persistence.entity;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.persistence.entity.AbstractEntity;

@Entity
@Table(name = "USER_MISSION_ENTITY", uniqueConstraints = { @UniqueConstraint(columnNames = { "simpleName" }) })
@SequenceGenerator(name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "USER_MISSION_SEQUENCE")
public class UserMissionEntity extends AbstractEntity {

	private UserEntity user;
	private MissionEntity mission;

	@ManyToOne
	@JoinColumns({ @JoinColumn(name = "USER_ID", referencedColumnName = "id", nullable = false) })
	public UserEntity getUser() {
		return this.user;
	}

	@ManyToOne
	@JoinColumns({ @JoinColumn(name = "MISSION_ID", referencedColumnName = "id", nullable = false) })
	public MissionEntity getMission() {
		return this.mission;
	}

	public void setUser(UserEntity user) {
		this.user = user;
	}

	public void setMission(MissionEntity mission) {
		this.mission = mission;
	}

}
