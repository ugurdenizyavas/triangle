package com.deniz.role.persistence;

import java.util.List;

import com.deniz.framework.persistence.entity.AbstractEntity;
import com.deniz.role.persistence.entity.AppRoleEntity;
import com.deniz.role.persistence.entity.AppRoleGroupEntity;
import com.deniz.role.persistence.entity.AppUserEntity;
import com.deniz.role.persistence.entity.AppUserGroupEntity;

public interface AppRoleInteractionsDao<E extends AbstractEntity> {
	public void save(E appRoleEntity);

	public List<AppUserGroupEntity> getUserGroupsByUserName(String userName);

	public AppUserEntity getByUserNameAndPassword(String userName, String password);

	public List<AppRoleEntity> getRolesByName(String domain, String roleName);

	public AppRoleGroupEntity getRoleGroupByRoleGroupName(String roleGroupName);

	public AppUserGroupEntity getUserGroupByUserGroupName(String userGroupName);

	public List<AppRoleEntity> getRolesByRoleGroups(String domain, List<AppRoleGroupEntity> roleGroupList);

	public List<AppRoleGroupEntity> getRoleGroupsByUserGroups(List<AppUserGroupEntity> userGroupList);

	public List<AppRoleEntity> getNotLoginRequiredRoles();

}
