package com.deniz.role.persistence.impl;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

import com.deniz.framework.persistence.DaoTemplate;
import com.deniz.framework.persistence.entity.AbstractEntity;
import com.deniz.role.persistence.AppRoleInteractionsDao;
import com.deniz.role.persistence.entity.AppRoleEntity;
import com.deniz.role.persistence.entity.AppRoleGroupEntity;
import com.deniz.role.persistence.entity.AppUserEntity;
import com.deniz.role.persistence.entity.AppUserGroupEntity;
import com.deniz.role.persistence.entity.AppUserGroupRoleGroupEntity;
import com.deniz.role.persistence.entity.AppUserUserGroupEntity;

public class AppRoleInteractionsDaoImpl<E extends AbstractEntity> extends DaoTemplate<E> implements AppRoleInteractionsDao<E> {

	@SuppressWarnings("unchecked")
	public List<AppRoleEntity> getRolesByRoleGroups(String domain, List<AppRoleGroupEntity> roleGroupList) {
		Criteria roleCriteria = getCurrentSession().createCriteria(AppRoleEntity.class);
		roleCriteria.add(Restrictions.eq("domain", domain));
		roleCriteria.add(Restrictions.in("roleGroup", roleGroupList));
		return roleCriteria.list();
	}

	@SuppressWarnings("unchecked")
	public List<AppRoleGroupEntity> getRoleGroupsByUserGroups(List<AppUserGroupEntity> userGroupList) {
		Criteria userRoleGroupCriteria = getCurrentSession().createCriteria(AppUserGroupRoleGroupEntity.class);
		userRoleGroupCriteria.add(Restrictions.in("userGroup", userGroupList));
		userRoleGroupCriteria.setProjection(Projections.property("roleGroup"));
		List<AppRoleGroupEntity> roleGroupList = userRoleGroupCriteria.list();
		return roleGroupList;
	}

	@SuppressWarnings("unchecked")
	public List<AppRoleEntity> getRolesByName(String domain, String roleName) {
		Criteria criteria = getCurrentSession().createCriteria(AppRoleEntity.class);
		criteria.add(Restrictions.eq("domain", domain));
		criteria.add(Restrictions.eq("roleName", roleName));
		List<AppRoleEntity> roles = criteria.list();
		return roles;
	}

	@Override
	public AppRoleGroupEntity getRoleGroupByRoleGroupName(String roleGroupName) {
		Criteria criteria = getCurrentSession().createCriteria(AppRoleGroupEntity.class);
		criteria.add(Restrictions.eq("roleGroupName", roleGroupName));
		return (AppRoleGroupEntity) criteria.uniqueResult();
	}

	@Override
	public AppUserGroupEntity getUserGroupByUserGroupName(String userGroupName) {
		Criteria criteria = getCurrentSession().createCriteria(AppUserGroupEntity.class);
		criteria.add(Restrictions.eq("userGroupName", userGroupName));
		return (AppUserGroupEntity) criteria.uniqueResult();
	}

	@Override
	public AppUserEntity getByUserNameAndPassword(String userName, String password) {
		Criteria criteria = getCurrentSession().createCriteria(AppUserEntity.class);
		criteria.add(Restrictions.eq("userName", userName));
		criteria.add(Restrictions.eq("password", password));
		return (AppUserEntity) criteria.uniqueResult();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<AppUserGroupEntity> getUserGroupsByUserName(String userName) {
		Criteria criteria = getCurrentSession().createCriteria(AppUserUserGroupEntity.class);
		Criteria userCriteria = getCurrentSession().createCriteria(AppUserEntity.class);
		userCriteria.add(Restrictions.eq("username", userName));
		criteria.setProjection(Projections.property("userGroup"));
		return criteria.list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<AppRoleEntity> getNotLoginRequiredRoles() {
		Criteria criteria = getCurrentSession().createCriteria(AppRoleEntity.class);
		criteria.add(Restrictions.eq("loginRequired", false));
		List<AppRoleEntity> roles = criteria.list();
		return roles;
	}

}
