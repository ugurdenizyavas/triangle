package com.deniz.role.persistence.entity;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.deniz.framework.persistence.entity.AbstractEntity;

@SuppressWarnings( "serial" )
@Entity
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "USER_GROUP_ID", "ROLE_GROUP_ID" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_USER_GROUP_ROLE_GROUP_SEQ" )
public class AppUserGroupRoleGroupEntity extends AbstractEntity
{
	private AppUserGroupEntity userGroup;
	private AppRoleGroupEntity roleGroup;

	@ManyToOne
	@JoinColumns( { @JoinColumn( name = "USER_GROUP_ID", referencedColumnName = "id", nullable = false )})
	public AppUserGroupEntity getUserGroup()
	{
		return userGroup;
	}

	public void setUserGroup( AppUserGroupEntity userGroup )
	{
		this.userGroup = userGroup;
	}

	@ManyToOne
	@JoinColumns( { @JoinColumn( name = "ROLE_GROUP_ID", referencedColumnName = "id", nullable = false )})
	public AppRoleGroupEntity getRoleGroup()
	{
		return roleGroup;
	}

	public void setRoleGroup( AppRoleGroupEntity roleGroup )
	{
		this.roleGroup = roleGroup;
	}

	@Transient
	@Override
	public String getInfo()
	{
		return "user group " + userGroup.getInfo() + ": role group" + roleGroup.getInfo();
	}


}
