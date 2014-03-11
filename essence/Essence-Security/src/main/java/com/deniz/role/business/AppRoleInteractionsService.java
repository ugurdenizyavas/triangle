package com.deniz.role.business;

import java.util.List;

import com.deniz.role.business.domain.AppRoleDto;
import com.deniz.role.business.domain.AppRoleGroupDto;
import com.deniz.role.business.domain.AppUserDto;
import com.deniz.role.business.domain.AppUserGroupDto;


public interface AppRoleInteractionsService
{

	public void save( AppRoleDto appRoleDto );

	public void save( AppRoleGroupDto appRoleGroupDto );

	public void save( AppUserDto appUserDto );

	public void save( AppUserGroupDto appUserGroupDto );

	public List<AppRoleDto> getUserRoles( String domain, String userName );

	public AppUserDto authenticate( String userName, String password );
}
