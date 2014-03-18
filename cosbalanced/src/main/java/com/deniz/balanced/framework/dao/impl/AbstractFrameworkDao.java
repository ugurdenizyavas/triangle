package com.deniz.balanced.framework.dao.impl;

import com.deniz.framework.persistence.DaoTemplate;
import com.deniz.framework.persistence.entity.AbstractEntity;
import org.apache.commons.lang.Validate;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;

import java.util.List;

public abstract class AbstractFrameworkDao<E extends AbstractEntity> extends DaoTemplate<E> {

	protected abstract Class<?> getSupportedClass();

	@SuppressWarnings("unchecked")
	public E getById(long id) {
		Validate.notNull(id);
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		criteria.add(Restrictions.eq("id", id));
		return (E) criteria.uniqueResult();
	}

	@SuppressWarnings("unchecked")
	public E getByName(String name) {
		Validate.notNull(name);
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		criteria.add(Restrictions.eq("simpleName", name));
		return (E) criteria.uniqueResult();
	}

	@SuppressWarnings("unchecked")
	public List<E> getAll() {
		Criteria criteria = getCurrentSession().createCriteria(getSupportedClass());
		return criteria.list();
	}

	public void removeAll() {
		List<E> all = getAll();
		for (E one : all) {
			getCurrentSession().delete(one);
		}
	}

}
