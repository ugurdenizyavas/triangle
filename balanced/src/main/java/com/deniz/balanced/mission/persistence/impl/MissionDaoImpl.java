package com.deniz.balanced.mission.persistence.impl;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang.Validate;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;

import com.deniz.balanced.framework.dao.impl.AbstractFrameworkDao;
import com.deniz.balanced.mission.persistence.MissionDao;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;

public class MissionDaoImpl extends AbstractFrameworkDao<MissionEntity> implements MissionDao {

	@Override
	protected Class<?> getSupportedClass() {
		return MissionEntity.class;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<MissionEntity> getValidMissions(Date validity) {
		Validate.notNull(validity);
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		criteria.add(Restrictions.ge("validFrom", validity));
		criteria.add(Restrictions.le("validTo", validity));
		return criteria.list();
	}
}
