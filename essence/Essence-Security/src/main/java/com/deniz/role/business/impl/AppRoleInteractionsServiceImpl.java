package com.deniz.role.business.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.deniz.role.business.AppRoleInteractionsService;
import com.deniz.role.business.domain.AppRoleDto;
import com.deniz.role.business.domain.AppRoleGroupDto;
import com.deniz.role.business.domain.AppUserDto;
import com.deniz.role.business.domain.AppUserGroupDto;
import com.deniz.role.persistence.AppRoleInteractionsDao;
import com.deniz.role.persistence.entity.AppRoleEntity;
import com.deniz.role.persistence.entity.AppRoleGroupEntity;
import com.deniz.role.persistence.entity.AppUserEntity;
import com.deniz.role.persistence.entity.AppUserGroupEntity;
import com.deniz.role.persistence.entity.AppUserGroupRoleGroupEntity;
import com.deniz.role.persistence.entity.AppUserUserGroupEntity;

public class AppRoleInteractionsServiceImpl implements AppRoleInteractionsService {
	@SuppressWarnings("rawtypes")
	private AppRoleInteractionsDao roleInteractionsDao;

	@SuppressWarnings("rawtypes")
	public void setRoleInteractionsDao(AppRoleInteractionsDao roleInteractionsDao) {
		this.roleInteractionsDao = roleInteractionsDao;
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public List<AppRoleDto> getUserRoles(String domain, String userName) {
		List<AppRoleDto> appRoleDtos = new ArrayList<AppRoleDto>();
		List<AppUserGroupEntity> userGroupList = roleInteractionsDao.getUserGroupsByUserName(userName);

		List<AppRoleGroupEntity> roleGroupList = roleInteractionsDao.getRoleGroupsByUserGroups(userGroupList);
		// Add wildcard groups into list as well
		roleGroupList.add(roleInteractionsDao.getRoleGroupByRoleGroupName("*"));

		List<AppRoleEntity> rolesEntity = roleInteractionsDao.getRolesByRoleGroups(domain, roleGroupList);
		// Add wildcard domains into list as well
		rolesEntity.addAll(roleInteractionsDao.getNotLoginRequiredRoles());

		for (AppRoleEntity appRoleEntity : rolesEntity) {
			AppRoleDto appRoleDto = new AppRoleDto();
			appRoleDto.getRoleNameMeta().setValue(appRoleEntity.getRoleName());
			appRoleDto.getDomainMeta().setValue(appRoleEntity.getDomain());
			appRoleDto.getLoginRequiredMeta().setValue(appRoleEntity.getLoginRequired().toString());
			appRoleDto.getRoleGroupMeta().setValue(appRoleEntity.getRoleGroup().getRoleGroupName());
			appRoleDtos.add(appRoleDto);
		}
		return appRoleDtos;
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public AppUserDto authenticate(String userName, String password) {
		AppUserEntity appUserEntity = roleInteractionsDao.getByUserNameAndPassword(userName, password);
		if (appUserEntity != null) {
			AppUserDto appUserDto = new AppUserDto();
			appUserDto.getUserNameMeta().setValue(appUserEntity.getUserName());
			appUserDto.getPasswordMeta().setValue(appUserEntity.getPassword());
			List<AppUserGroupEntity> userGroupEntities = roleInteractionsDao.getUserGroupsByUserName(userName);
			for (AppUserGroupEntity appUserGroupEntity : userGroupEntities) {
				appUserDto.getUserGroupsMeta().getValueList().add(appUserGroupEntity.getId() + "");
			}
			return appUserDto;
		}
		throw new RuntimeException("Authentication failed");
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public void save(AppRoleDto appRoleDto) {
		AppRoleEntity appRoleEntity = new AppRoleEntity();
		appRoleEntity.setRoleName(appRoleDto.getRoleNameMeta().getValue());
		AppRoleGroupEntity roleGroupEntity = roleInteractionsDao.getRoleGroupByRoleGroupName(appRoleDto.getRoleGroupMeta().getValue());
		appRoleEntity.setRoleGroup(roleGroupEntity);
		appRoleEntity.setDomain(appRoleDto.getDomainMeta().getValue());
		appRoleEntity.setLoginRequired(Boolean.valueOf(appRoleDto.getLoginRequiredMeta().getValue()));
		roleInteractionsDao.save(appRoleEntity);
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public void save(AppRoleGroupDto appRoleGroupDto) {
		AppRoleGroupEntity appRoleGroupEntity = new AppRoleGroupEntity();
		appRoleGroupEntity.setRoleGroupName(appRoleGroupDto.getRoleGroupNameMeta().getValue());
		roleInteractionsDao.save(appRoleGroupEntity);
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public void save(AppUserDto appUserDto) {
		AppUserEntity appUserEntity = new AppUserEntity();
		appUserEntity.setUserName(appUserDto.getUserNameMeta().getValue());
		appUserEntity.setPassword(appUserDto.getPasswordMeta().getValue());
		roleInteractionsDao.save(appUserEntity);
		List<String> userGroupList = appUserDto.getUserGroupsMeta().getValueList();
		for (String userGroupName : userGroupList) {
			AppUserGroupEntity appUserGroupEntity = roleInteractionsDao.getUserGroupByUserGroupName(userGroupName);
			AppUserUserGroupEntity appUserUserGroupEntity = new AppUserUserGroupEntity();
			appUserUserGroupEntity.setUserGroup(appUserGroupEntity);
			appUserUserGroupEntity.setUserEntity(appUserEntity);
			roleInteractionsDao.save(appUserUserGroupEntity);
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public void save(AppUserGroupDto appUserGroupDto) {
		AppUserGroupEntity appUserGroupEntity = new AppUserGroupEntity();
		appUserGroupEntity.setUserGroupName(appUserGroupDto.getUserGroupNameMeta().getValue());
		roleInteractionsDao.save(appUserGroupEntity);

		for (String roleGroupName : appUserGroupDto.getRoleGroupsMeta().getValueList()) {
			AppRoleGroupEntity appRoleGroupEntity = roleInteractionsDao.getRoleGroupByRoleGroupName(roleGroupName);
			AppUserGroupRoleGroupEntity appUserGroupRoleGroupEntity = new AppUserGroupRoleGroupEntity();
			appUserGroupRoleGroupEntity.setUserGroup(appUserGroupEntity);
			appUserGroupRoleGroupEntity.setRoleGroup(appRoleGroupEntity);
			roleInteractionsDao.save(appUserGroupRoleGroupEntity);
		}

	}

	@SuppressWarnings("unchecked")
	@Transactional
	public List<AppRoleGroupEntity> getRoleGroupsByRoleName(String domain, String roleName) {
		List<AppRoleEntity> roles = roleInteractionsDao.getRolesByName(domain, roleName);

		List<AppRoleGroupEntity> roleGroupEntities = new ArrayList<AppRoleGroupEntity>();
		for (AppRoleEntity appRoleEntity : roles) {
			roleGroupEntities.add(appRoleEntity.getRoleGroup());
		}
		return roleGroupEntities;
	}
}
