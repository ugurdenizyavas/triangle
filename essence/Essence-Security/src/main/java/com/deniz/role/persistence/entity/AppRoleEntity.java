package com.deniz.role.persistence.entity;

import javax.persistence.Column;
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
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "ROLE_NAME", "ROLE_GROUP_ID" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_ROLE_SEQ" )
public class AppRoleEntity extends AbstractEntity
{

	private String domain;
	private Boolean loginRequired;
	private String roleName;
	private AppRoleGroupEntity roleGroup;


	@Column( name = "DOMAIN" )
	public String getDomain()
	{
		return domain;
	}


	@Column( name = "LOGIN_REQUIRED" )
	public Boolean getLoginRequired()
	{
		return loginRequired;
	}

	@Column( name = "ROLE_NAME" )
	public String getRoleName()
	{
		return roleName;
	}

	@ManyToOne
	@JoinColumns( { @JoinColumn( name = "ROLE_GROUP_ID", referencedColumnName = "id", nullable = false ) } )
	public AppRoleGroupEntity getRoleGroup()
	{
		return roleGroup;
	}

	public void setRoleName( String roleName )
	{
		this.roleName = roleName;
	}

	public void setRoleGroup( AppRoleGroupEntity roleGroup )
	{
		this.roleGroup = roleGroup;
	}

	public void setDomain( String domain )
	{
		this.domain = domain;
	}

	public void setLoginRequired( Boolean loginRequired )
	{
		this.loginRequired = loginRequired;
	}

	@Transient
	@Override
	public String getInfo()
	{
		return roleName;
	}


}
