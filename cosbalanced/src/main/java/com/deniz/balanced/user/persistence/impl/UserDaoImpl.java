package com.deniz.balanced.user.persistence.impl;

import com.deniz.balanced.framework.dao.impl.AbstractFrameworkDao;
import com.deniz.balanced.user.persistence.UserDao;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import org.apache.commons.lang.Validate;
import org.hibernate.Criteria;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

import java.util.List;

public class UserDaoImpl extends AbstractFrameworkDao<UserEntity> implements UserDao {

	@Override
	public UserEntity getByReference(String reference) {
		Validate.notNull(reference);
		Criteria criteria = getCurrentSession().createCriteria(UserEntity.class);
		criteria.add(Restrictions.eq("reference", reference));
		return (UserEntity) criteria.uniqueResult();
	}

	@Override
	public UserEntity getByEmail(String email) {
		Validate.notNull(email);
		Criteria criteria = getCurrentSession().createCriteria(UserEntity.class);
		criteria.add(Restrictions.eq("email", email));
		return (UserEntity) criteria.uniqueResult();
	}

	@Override
	protected Class<?> getSupportedClass() {
		return UserEntity.class;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<UserEntity> getChilds(UserEntity user) {
		Validate.notNull(user);
		Criteria criteria = getCurrentSession().createCriteria(UserEntity.class);
		criteria.add(Restrictions.eq("ancestor", user));
		return criteria.list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<UserEntity> getAll(String sortOrder) {
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		criteria.addOrder(Order.desc(sortOrder));
		return criteria.list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<String> getAllType(String field) {
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		criteria.setProjection(Projections.property(field));
		return criteria.list();
	}

}