package com.deniz.balanced.mission.persistence.entity;

import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.persistence.entity.AbstractEntity;

import javax.persistence.*;

@Entity
@Table(name = "USER_MISSION_ENTITY", uniqueConstraints = {@UniqueConstraint(columnNames = {"simpleName"})})
@SequenceGenerator(name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "USER_MISSION_SEQUENCE")
public class UserMissionEntity extends AbstractEntity {

    private UserEntity userEntity;
    private MissionEntity mission;

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "USER_ID", referencedColumnName = "id", nullable = false)})
    public UserEntity getUserEntity() {
        return this.userEntity;
    }

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "MISSION_ID", referencedColumnName = "id", nullable = false)})
    public MissionEntity getMission() {
        return this.mission;
    }

    public void setUserEntity(UserEntity userEntity) {
        this.userEntity = userEntity;
    }

    public void setMission(MissionEntity mission) {
        this.mission = mission;
    }

}
