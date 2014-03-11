package com.deniz.balanced.mission.persistence.impl;

import org.apache.commons.lang.Validate;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;

import com.deniz.balanced.framework.dao.impl.AbstractFrameworkDao;
import com.deniz.balanced.mission.persistence.UserMissionDao;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.balanced.mission.persistence.entity.UserMissionEntity;
import com.deniz.balanced.user.persistence.entity.UserEntity;

public class UserMissionDaoImpl extends AbstractFrameworkDao<UserMissionEntity> implements UserMissionDao {

	@Override
	public UserMissionEntity getByUserAndMission(UserEntity user, MissionEntity mission) {
		Validate.notNull(user);
		Validate.notNull(mission);
		Criteria criteria = getCurrentSession().createCriteria(UserMissionEntity.class);
		criteria.add(Restrictions.ge("user", user));
		criteria.add(Restrictions.le("mission", mission));
		return (UserMissionEntity) criteria.uniqueResult();
	}

	@Override
	protected Class<?> getSupportedClass() {
		return UserMissionEntity.class;
	}

}
